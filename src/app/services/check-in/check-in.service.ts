// src/app/services/check-in/check-in.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { Router } from '@angular/router';
import { CheckInInterfaceResponse } from '../../interfaces/checkIn-interface';
import { CheckInOrOut } from '../../interfaces/checkInOrOut-interface';
import { Observable, firstValueFrom } from 'rxjs';
import { WebSocketService } from '../websocket/web-socket.service';
import { CountryStorageService } from '../storage/country-storage.service';
import { UserStorageService } from '../storage/user-storage.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable({
  providedIn: 'root'
})
export class CheckInService {

  constructor(
    private _http: HttpClient,
    private _alertService: AlertService,
    private _router: Router,
    private _socketService: WebSocketService,
    private _countryStorageService: CountryStorageService,
    private _userStorageService: UserStorageService,
    private _notificationsService: NotificationsService
  ) {}

  // =========================
  // Helpers para JSON
  // =========================
  private textOrNull(value: any): string | null {
    if (value === null || value === undefined) { return null; }
    const text = String(value).trim();
    if (!text || text.toLowerCase() === 'null' || text.toLowerCase() === 'undefined') {
      return null;
    }
    return text;
  }

  private numberOrNull(value: any): number | null {
    const text = this.textOrNull(value);
    if (text === null) { return null; }
    // Solo enteros positivos
    return /^\d+$/.test(text) ? Number(text) : null;
  }

  private isoOrNull(value: any): string | null {
    if (value == null) return null;
    const d = value instanceof Date ? value : new Date(String(value).trim());
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  // =========================
  // Crear check-in (flujo guardia) — JSON
  // =========================
  async createCheckin(
    guest_name: string,
    guest_lastname: string,
    dni: any,
    id_owner: any,
    id_guard: any,
    income_date: any,
    details: any,
    transport: any,
    patent: any
  ) {
    console.log(guest_name, guest_lastname, dni, id_owner, id_guard, income_date, details, transport);

    const country = await this._countryStorageService.getCountry();

    const body = {
      guest_name: this.textOrNull(guest_name),
      guest_lastname: this.textOrNull(guest_lastname),
      DNI: this.textOrNull(dni),
      id_owner: this.numberOrNull(id_owner),
      id_guard: this.numberOrNull(id_guard),
      id_country: this.numberOrNull(country?.id),
      income_date: this.isoOrNull(income_date),
      details: this.textOrNull(details),
      transport: this.textOrNull(transport),
      patent: this.textOrNull(patent)
    };

    await this._alertService.setLoading();

    try {
      const res: any = await firstValueFrom(this._http.post(`${environment.URL}/api/checkin`, body));
      console.log(res);

      // Socket: aviso de nuevo check-in
      this._socketService.notificarCheckIn(res['checkIn']);

      // Notificación al propietario
      try {
        const guardUser = await this._userStorageService.getUser();
        const timeStr = new Date(body.income_date || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const title = 'Vigilador';
        const content = `Ingreso de visitante (${guest_name} ${guest_lastname}, ${timeStr}) SOLICITADO por vigilador (${guardUser?.name || ''} ${guardUser?.lastname || ''})`;
        const payload: any = {
          id_user: Number(body.id_owner ?? 0),
          title,
          content,
          read: false
        };
        await firstValueFrom(this._notificationsService.createNotification(payload));
      } catch {}

      await this._alertService.removeLoading();
      await this._alertService.showAlert('¡Listo!', 'El Check-in fue enviado con exito al propietario');
      await this._router.navigate(['/vigiladores/home']);
      return res;
    } catch (err) {
      await this._alertService.removeLoading();
      await this._alertService.showAlert('Error', 'No se pudo crear el Check-in');
      throw err;
    }
  }

  // =========================
  // Crear check-in (flujo propietario) — JSON
  // =========================
  async createCheckInFromOwner(
    name: string,
    lastname: string,
    dni: any,
    income_date: any,
    id_owner: any,
    id_country: any
  ) {
    const body = {
      guest_name: this.textOrNull(name),
      guest_lastname: this.textOrNull(lastname),
      DNI: this.textOrNull(dni),
      income_date: this.isoOrNull(income_date),
      id_owner: this.numberOrNull(id_owner),
      confirmed_by_owner: true,
      id_country: this.numberOrNull(id_country),
      id_guard: null,
      transport: null,
      details: null,
      patent: null
    };

    await this._alertService.setLoading();

    try {
      const res = await firstValueFrom(this._http.post(`${environment.URL}/api/checkin`, body));
      // Socket: visita rápida autorizada por owner
      this._socketService.notificarNuevoConfirmedByOwner(res);
      return res;
    } catch (err) {
      await this._alertService.showAlert('Error', 'No se pudo crear el Check-in');
      throw err;
    } finally {
      await this._alertService.removeLoading();
    }
  }

  // =========================
  // ✅ Confirmar por propietario (endpoint dedicado)
  // =========================
  ownerConfirm(id_checkin: number) {
    return this._http.patch(`${environment.URL}/api/checkin/confirm/${id_checkin}`, {});
  }

  // =========================
  // ⚠️ Deprecado: no usar para autorizar; usar ownerConfirm(id)
  // =========================
  /** @deprecated No usar para autorización; usar ownerConfirm(id) */
  changeCheckInConfirmedByOwner(id: any, status: any) {
    return this._http.patch(`${environment.URL}/api/checkin/changeStatus/${id}`, {
      new_status: status
    });
  }

  // =========================
  // Consultas
  // =========================
  getCheckinsByOwnerID(id: number) {
    return this._http.get<CheckInInterfaceResponse[]>(`${environment.URL}/api/checkin/get_by_owner/${id}`);
  }

  getAllCheckInConfirmedByOwner(id_country: number) {
    return this._http.get<CheckInOrOut[]>(`${environment.URL}/api/checkin/confirmed/${id_country}`);
  }

  getAllRegisters(id_country: number) {
    return this._http.get<any[]>(`${environment.URL}/api/checkin/registers/${id_country}`);
  }

  getAllCheckInApprovedByCountryId(id_country: number): Observable<CheckInOrOut[]> {
    return this._http.get<CheckInOrOut[]>(`${environment.URL}/api/checkin/approved/${id_country}`);
  }

  getAllCheckInTodayByOwnerID(id_owner: number): Observable<CheckInOrOut[]> {
    return this._http.get<CheckInOrOut[]>(`${environment.URL}/api/checkin/getAllToday/${id_owner}`);
  }

  getAllCheckoutFalse() {
    return this._http.get<CheckInOrOut[]>(`${environment.URL}/api/checkin/checkout`);
  }

  // =========================
  // Update flags
  // =========================
  async updateCheckInTrue(id: any) {
    const res = await firstValueFrom(this._http.patch(`${environment.URL}/api/checkin/${id}`, {}));
    this._socketService.notificarNuevoConfirmedByOwner(res);
    return res;
  }

  async updateCheckOutTrue(id: any) {
    const res: any = await firstValueFrom(this._http.patch(`${environment.URL}/api/checkin/checkout/${id}`, {}));
    this._socketService.notificarNuevoConfirmedByOwner(res['update']);
    return res;
  }
}
