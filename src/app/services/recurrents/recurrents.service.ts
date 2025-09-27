import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { RecurrentsInterface } from '../../interfaces/recurrents-interface';
import { Observable, of } from 'rxjs';
import { catchError, map, take, timeout, tap } from 'rxjs/operators';
import { CountryStorageService } from '../storage/country-storage.service';

@Injectable({ providedIn: 'root' })
export class RecurrentsService {
  // Activalo en true si querés forzar que el servicio NO llame al backend (para probar la UI)
  private readonly SAFE_MODE = false;
  private readonly HTTP_TIMEOUT_MS = 10000; // 10s para evitar que se “cuelgue” si la API no responde

  constructor(
    private http: HttpClient,
    private alert: AlertService,
    private router: Router,
    private countryStorage: CountryStorageService
  ) {}


  // CREATE
  
  async addRecurrent(
    id_property: number | string,
    name: string,
    lastname: string,
    dni: string | number,
    role: 'admin' | 'owner'
  ): Promise<void> {
    const fd = new FormData();
    fd.append('id_property', String(id_property));
    fd.append('guest_name', String(name));
    fd.append('guest_lastname', String(lastname));
    fd.append('dni', String(dni));

    await this.alert.setLoading();

    this.http.post(`${environment.URL}/api/recurrents`, fd).pipe(
      timeout(this.HTTP_TIMEOUT_MS),
      take(1),
      tap(() => console.log('[recurrents] POST /recurrents OK')),
      catchError(async (err) => {
        console.error('[recurrents] POST /recurrents ERROR', err);
        await this.alert.removeLoading();
        this.alert.showAlert('¡Ooops!', err?.error?.msg ?? 'No se pudo guardar el recurrente.');
        throw err;
      })
    ).subscribe(async () => {
      await this.alert.removeLoading();
      this.alert.showAlert('¡Listo!', 'El invitado recurrente se agregó con éxito');
      this.router.navigate(['/admin/country-recurrents']);
    });
  }

  
  // READ (listados)
  
  async getRecurrentsByCountry(): Promise<Observable<RecurrentsInterface[]>> {
    if (this.SAFE_MODE) {
      console.warn('[recurrents] SAFE_MODE habilitado → devolviendo []');
      return of([]);
    }

    const c = await this.countryStorage.getCountry().catch(() => null);
    const id = c?.id;
    if (!id) {
      console.warn('[recurrents] No hay country en storage → []');
      return of([]);
    }

    const url = `${environment.URL}/api/recurrents/get-by-country/${id}`;
    console.log('[recurrents] GET', url);

    return this.http.get<RecurrentsInterface[]>(url).pipe(
      timeout(this.HTTP_TIMEOUT_MS),
      take(1),
      map(list => list ?? []),
      tap(list => console.log('[recurrents] getRecurrentsByCountry OK, items:', list.length)),
      catchError((err) => {
        console.error('[recurrents] getRecurrentsByCountry ERROR', err);
        return of([]);
      })
    );
  }

  getRecurrentsByCountryId(countryId: number): Observable<RecurrentsInterface[]> {
    if (this.SAFE_MODE) {
      console.warn('[recurrents] SAFE_MODE habilitado → devolviendo []');
      return of([]);
    }
    if (!countryId) return of([]);

    const url = `${environment.URL}/api/recurrents/get-by-country/${countryId}`;
    console.log('[recurrents] GET', url);

    return this.http.get<RecurrentsInterface[]>(url).pipe(
      timeout(this.HTTP_TIMEOUT_MS),
      take(1),
      map(list => list ?? []),
      tap(list => console.log('[recurrents] getRecurrentsByCountryId OK, items:', list.length)),
      catchError((err) => {
        console.error('[recurrents] getRecurrentsByCountryId ERROR', err);
        return of([]);
      })
    );
  }

  getByPropertyID(id: number | string): Observable<RecurrentsInterface[]> {
    if (this.SAFE_MODE) {
      console.warn('[recurrents] SAFE_MODE habilitado → devolviendo []');
      return of([]);
    }

    const url = `${environment.URL}/api/recurrents/get-by-property/${id}`;
    console.log('[recurrents] GET', url);

    return this.http.get<RecurrentsInterface[]>(url).pipe(
      timeout(this.HTTP_TIMEOUT_MS),
      take(1),
      map(list => list ?? []),
      tap(list => console.log('[recurrents] getByPropertyID OK, items:', list.length)),
      catchError((err) => {
        console.error('[recurrents] getByPropertyID ERROR', err);
        return of([]);
      })
    );
  }

  
  // READ (detalle)
  
  getById(id: number) {
    const url = `${environment.URL}/api/recurrents/${id}`;
    return this.http.get<RecurrentsInterface>(url).pipe(
      timeout(this.HTTP_TIMEOUT_MS),
      take(1),
      catchError(err => {
        console.error('[recurrents] getById ERROR', err);
        return of(null as any);
      })
    );
  }

  
  // UPDATE (status / campos)
  
  patchStatus(recurrentId: number | string, newStatus: boolean): Observable<any> {
    const fd = new FormData();
    fd.append('status', String(newStatus));

    const url = `${environment.URL}/api/recurrents/${recurrentId}`;
    console.log('[recurrents] PATCH', url, '→', newStatus);

    return this.http.patch(url, fd).pipe(
      timeout(this.HTTP_TIMEOUT_MS),
      take(1),
      tap(() => console.log('[recurrents] patchStatus OK')),
      catchError((err) => {
        console.error('[recurrents] patchStatus ERROR', err);
        return of(null);
      })
    );
  }

  updateRecurrent(id: number, payload: {
    id_property: number | string;
    guest_name: string;
    guest_lastname: string;
    dni: string | number;
  }) {
    const fd = new FormData();
    fd.append('id_property', String(payload.id_property));
    fd.append('guest_name', String(payload.guest_name));
    fd.append('guest_lastname', String(payload.guest_lastname));
    fd.append('dni', String(payload.dni));

    const url = `${environment.URL}/api/recurrents/${id}`;
    return this.http.patch(url, fd).pipe(
      timeout(this.HTTP_TIMEOUT_MS),
      take(1),
      tap(() => console.log('[recurrents] updateRecurrent OK')),
      catchError(err => {
        console.error('[recurrents] updateRecurrent ERROR', err);
        return of(null);
      })
    );
  }

  
  // DELETE
 
  deleteRecurrent(id: number) {
    const url = `${environment.URL}/api/recurrents/${id}`;
    return this.http.delete(url).pipe(
      timeout(this.HTTP_TIMEOUT_MS),
      take(1),
      tap(() => console.log('[recurrents] deleteRecurrent OK')),
      catchError(err => {
        console.error('[recurrents] deleteRecurrent ERROR', err);
        return of(null);
      })
    );
  }
}
