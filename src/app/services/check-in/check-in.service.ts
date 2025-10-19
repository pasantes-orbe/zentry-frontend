//src/app/services/check-in/check-in.service.ts
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

@Injectable({
  providedIn: 'root'
})
export class CheckInService {

  constructor(
    private _http: HttpClient,
    private _alertService: AlertService,
    private _router: Router,
    private _socketService: WebSocketService,
    private _countryStorageService: CountryStorageService
  ) { }

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
    // Anterior (aceptaba negativos): return /^-?\d+$/.test(text) ? Number(text) : null;
    // ✅ CORREGIDO: solo números positivos (IDs)
    return /^\d+$/.test(text) ? Number(text) : null;
  }

  private isoOrNull(value: any): string | null {
    if (value == null) return null;
    const d = value instanceof Date ? value : new Date(String(value).trim());
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  // =========================
  // createCheckin (JSON, sin FormData)
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

    // const country = await this._countryStorageService.getCountry()
    // const id_country = country.id.toString()
    // const formData = new FormData();
    // formData.append('guest_name', guest_name);
    // formData.append('guest_lastname', guest_lastname);
    // formData.append('DNI', dni);
    // formData.append('id_owner', id_owner);
    // formData.append('id_guard', id_guard);
    // formData.append('id_country', id_country);
    // formData.append('income_date', income_date);
    // formData.append('details', details);
    // formData.append('transport', transport);
    // formData.append('patent', patent);
    // ↑↑↑ COMENTADO: versión FormData (backend ahora espera JSON)

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

    // this._http.post(`${environment.URL}/api/checkin`, formData).subscribe(async res => {
    //   console.log(res)
    //   this._socketService.notificarCheckIn(res['checkIn'])
    //   await this._alertService.removeLoading();
    //   this._alertService.showAlert("¡Listo!", "El Check-in fue enviado con exito al propietario");
    //   this._router.navigate(['/vigiladores/home']);
    // })
    // ↑↑↑ COMENTADO: versión antigua con subscribe

    try {
      const res: any = await firstValueFrom(this._http.post(`${environment.URL}/api/checkin`, body));
      console.log(res);
      this._socketService.notificarCheckIn(res['checkIn']);
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
  // createCheckInFromOwner (JSON, con manejo de error)
  // =========================
  async createCheckInFromOwner(
    name: string,
    lastname: string,
    dni: any,
    income_date: any,
    id_owner: any,
    id_country: any
  ) {
    // const formData = new FormData();
    // formData.append('guest_name', name);
    // formData.append('guest_lastname', lastname);
    // formData.append('DNI', dni);
    // formData.append('income_date', income_date);
    // formData.append('id_owner', id_owner);
    // formData.append('confirmed_by_owner', 'true');
    // formData.append('id_country', id_country);
    // this._http.post(`${environment.URL}/api/checkin`, formData).subscribe(async res => {
    //   console.log(res)
    //   this._socketService.notificarNuevoConfirmedByOwner(res)
    //   await this._alertService.removeLoading();
    //   var getUrl = window.location;
    //   var baseUrl = getUrl.protocol + "//" + getUrl.host;
    //   window.location.href = `${getUrl.protocol + "//" + getUrl.host}/home/tabs/tab1`
    //   this._alertService.showAlert("¡Listo!", "El Check-in fue realizado con exito");
    // })
    // ↑↑↑ COMENTADO: FormData + subscribe + redirección dura

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
      this._socketService.notificarNuevoConfirmedByOwner(res);
      return res;
    } catch (err) {
      await this._alertService.showAlert('Error', 'No se pudo crear el Check-in');
      throw err;
    } finally {
      await this._alertService.removeLoading();
    }
  }

  changeCheckInConfirmedByOwner(id:any, status: any){
    const newStatus = !status
    return this._http.patch(`${environment.URL}/api/checkin/changeStatus/${id}`, {
      new_status: newStatus
    })
  }

  getCheckinsByOwnerID(id){
    return this._http.get<CheckInInterfaceResponse[]>(`${environment.URL}/api/checkin/get_by_owner/${id}`)
  }

  // filtrar por country, no se verifica campo del country en checkin Model

  getAllCheckInConfirmedByOwner(id_country){
    return this._http.get<CheckInOrOut[]>(`${environment.URL}/api/checkin/confirmed/${id_country}`)
  }

  getAllRegisters(id){
    return this._http.get<any[]>(`${environment.URL}/api/checkin/registers/${id}`)
  }

  getAllCheckInApprovedByCountryId(id_country): Observable<CheckInOrOut[]>{
    return this._http.get<CheckInOrOut[]>(`${environment.URL}/api/checkin/approved/${id_country}`)
  }

  getAllCheckInTodayByOwnerID(id): Observable<CheckInOrOut[]>{
    return this._http.get<CheckInOrOut[]>(`${environment.URL}/api/checkin/getAllToday/${id}`)
  }

  getAllCheckoutFalse(){
    return this._http.get<CheckInOrOut[]>(`${environment.URL}/api/checkin/checkout`)
  }

  // =========================
  // updateCheckInTrue (await en vez de subscribe)
  // =========================
  async updateCheckInTrue(id:any){
    // this._http.patch(`${environment.URL}/api/checkin/${id}`, {}).subscribe(res => {
    //   this._socketService.notificarNuevoConfirmedByOwner(res)
    // })
    // ↑↑↑ COMENTADO: versión antigua con subscribe

    const res = await firstValueFrom(this._http.patch(`${environment.URL}/api/checkin/${id}`, {}));
    this._socketService.notificarNuevoConfirmedByOwner(res)
    return res;
  }

  // =========================
  // updateCheckOutTrue (await en vez de subscribe)
  // =========================
  async updateCheckOutTrue(id:any){
    // this._http.patch(`${environment.URL}/api/checkin/checkout/${id}`, {}).subscribe(res => {
    //   this._socketService.notificarNuevoConfirmedByOwner(res['update'])
    // })
    // ↑↑↑ COMENTADO: versión antigua con subscribe

    const res: any = await firstValueFrom(this._http.patch(`${environment.URL}/api/checkin/checkout/${id}`, {}));
    this._socketService.notificarNuevoConfirmedByOwner(res['update'])
    return res;
  }
}

