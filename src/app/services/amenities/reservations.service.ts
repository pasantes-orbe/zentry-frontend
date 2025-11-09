// src/app/services/amenities/reservations.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  BehaviorSubject,
  firstValueFrom,
  of,
  from,
  switchMap,
  map,
  tap,
  catchError,
  throwError,
} from 'rxjs';
import { ReservationsInterface } from 'src/app/interfaces/reservations-interface';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { CountryStorageService } from '../storage/country-storage.service';
import { OwnerStorageService } from '../storage/owner-interface-storage.service';
import { UserStorageService } from '../storage/user-storage.service';
import { WebSocketService } from '../websocket/web-socket.service';

@Injectable({
  providedIn: 'root',
})
export class ReservationsService {
  private ownerReservationsSubject = new BehaviorSubject<ReservationsInterface[]>([]);
  public ownerReservations$: Observable<ReservationsInterface[]> =
    this.ownerReservationsSubject.asObservable();

  constructor(
    private _userStorageService: UserStorageService,
    private _countryStorageService: CountryStorageService,
    private _http: HttpClient,
    private _alertService: AlertService,
    private _router: Router,
    private _ownerStorageService: OwnerStorageService,
    private _webSocketService: WebSocketService
  ) {
    this.subscribeToWebSocketUpdates();
  }

  // Helpers: resuelven el ID de usuario de forma robusta
private async resolveCurrentUserId(): Promise<number | null> {
  try {
    const owner = await this._ownerStorageService.getOwner();
    const fromOwner =
      (owner as any)?.user?.id ??
      (owner as any)?.id ??
      (owner as any)?.ownerId ??
      (owner as any)?.user_id ??
      null;

    if (fromOwner) return Number(fromOwner);

    const u = await this._userStorageService.getUser();
    return u?.id ?? null;
  } catch {
    return null;
  }
}
// helper para obtener el ID del país
private resolveCurrentCountryId$(): Observable<number> {
  return from(this._countryStorageService.getCountry()).pipe(
    switchMap(country => {
      const countryID = country?.id ?? null;
      if (countryID != null) {
        return of(countryID);
      } else {
        return throwError(() => new Error('No se pudo obtener el ID del país.'));
      }
    })
  );
}

private resolveCurrentUserId$(): Observable<number> {
  return from(this.resolveCurrentUserId()).pipe(
    switchMap(id => id != null
      ? of(id)
      : throwError(() => new Error('No se pudo obtener el ID del usuario.')))
  );
}

private subscribeToWebSocketUpdates() {
  this._webSocketService.reservationUpdate$.subscribe(async (updatedReservation) => {
    const currentUserId = await this.resolveCurrentUserId();
    if (!currentUserId) return;
    if (currentUserId !== updatedReservation.user.id) return;

    const current = this.ownerReservationsSubject.getValue();
    const idx = current.findIndex(r => r.id === updatedReservation.id);
    if (idx !== -1) {
      const next = [...current];
      next[idx] = updatedReservation;
      this.ownerReservationsSubject.next(next);
    } else {
      void this.loadOwnerReservations();
    }
  });
}

private async fetchReservationsByOwner(): Promise<ReservationsInterface[]> {
  try {
    const userID = await this.resolveCurrentUserId();
    if (!userID) throw new Error('Owner ID not found for fetching reservations');
    return await firstValueFrom(this.getAllByUser(userID));
  } catch (error) {
    console.error('Error fetching reservations for owner:', error);
    return [];
  }
}

  public async loadOwnerReservations(): Promise<void> {
    const reservations = await this.fetchReservationsByOwner();
    this.ownerReservationsSubject.next(reservations);
  }

  public createReservation(reservationData: any): Observable<any> {
    return from(this._userStorageService.getUser()).pipe(
      switchMap(user => {
        const userID = user?.id;
        if (!userID) {
          throw new Error('No se pudo obtener el ID del usuario.');
        }

        // Enviar como multipart/form-data para que el backend parsee guests (string) y campos asociados
        const formData = new FormData();
        formData.append('id_user', String(userID));
        formData.append('id_amenity', String(reservationData.id_amenity ?? ''));
        formData.append('date', String(reservationData.date ?? ''));
        if (reservationData.details != null) formData.append('details', String(reservationData.details));

        // guests debe ir como JSON string según contrato del backend
        const guests = Array.isArray(reservationData.guests) ? reservationData.guests : [];
        if (guests.length > 0) {
          formData.append('guests', JSON.stringify(guests));
        }

        return this._http.post(`${environment.URL}/api/reservations`, formData).pipe(
          tap(async () => {
            console.log('Reserva creada.');
            await this.loadOwnerReservations();
          }),
            catchError(async err => {
              console.error('Error al crear reserva (HTTP):', err);
               this._alertService.removeLoading();
            }),
          map(res => res),
          catchError(async err => {
            console.error('Error al crear reserva (HTTP):', err);
             this._alertService.removeLoading();

            if (err.status === 409) {
              // 💥 Horario Ocupado
              this._alertService.showAlert(
          'Horario no disponible',
          err?.error?.msg || 'Ya existe otra reserva en este horario.'
              );
              return throwError(() => err);
            }

            // Otros errores
            this._alertService.showAlert(
              '¡Ooops!',
              `${err?.error?.msg || 'Error al crear la reserva.'}`
            );

            return throwError(() => err);
          })
        );
      }),
      catchError(async err => {
        console.error('Error de flujo (ID o Storage):', err);
        if (err.message === 'No se pudo obtener el ID del usuario.') {
          this._alertService.showAlert('Error', err.message);
        }
        this._alertService.removeLoading();
        return throwError(() => err);
      })
    );
  }

  public getReservationsByOwner(): Observable<ReservationsInterface[]> {
    return this.ownerReservations$;
  }

  public getReservationsByAmenityAndDate(id_amenity: number, date: string) {
  return this._http.get<any[]>(`${environment.URL}/api/reservations/check/${id_amenity}/${date}`);
  }


  public getAllByUser(userID: number): Observable<ReservationsInterface[]> {
    return this._http.get<ReservationsInterface[]>(
      `${environment.URL}/api/reservations/get_by_user/${userID}`
    );
  }

public getAllByCountry(): Observable<ReservationsInterface[]> {
  return this.resolveCurrentCountryId$().pipe(
    switchMap(countryID => {
      // 🚀 Endpoint correcto para el Admin
      const url = `${environment.URL}/api/reservations/country/get_by_id/${countryID}`;
      return this._http.get<ReservationsInterface[]>(url);
    }),
    catchError((err) => {
      console.error('Error al cargar reservas por país para Admin:', err);
      return of([]);
    })
  );
}

  public getAllByCountryAndStatus(id_country: number, status: string) {
    return this._http.get<any[]>(
      `${environment.URL}/api/reservations/${id_country}?status=${status}`
    );
  }

  public updateStatus(status: boolean, reservationID: number) {
    // Algunos endpoints pueden responder 200 sin cuerpo, lo que rompe el parser JSON por defecto.
    // Pedimos 'text' como respuesta para evitar errores de parseo aunque el servidor no devuelva JSON.
    return this._http.patch(
      `${environment.URL}/api/reservations/${reservationID}/${status}`,
      {},
      { responseType: 'text' as 'json' }
    );
  }

  public reservationGuests(id_reservation: number) {
    return this._http.get<any[]>(`${environment.URL}/api/invitation/${id_reservation}`);
  }
  public getOccupied(id_amenity: number, date: string): Observable<any[]> {
  return this._http.get<any[]>(
    `${environment.URL}/api/reservations/occupied/${id_amenity}/${date}`
    );
  }
  public getOccupiedHours(id_amenity: number, date: string): Observable<string[]> {
  return this._http.get<string[]>(`${environment.URL}/api/reservations/occupied/${id_amenity}/${date}`);
  }


}
