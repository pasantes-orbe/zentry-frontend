// src/app/services/recurrents/recurrents.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { RecurrentsInterface } from '../../interfaces/recurrents-interface';
// Se agrega 'from' (para convertir Promise a Observable)
import { Observable, of, from } from 'rxjs'; 
// Se agrega 'switchMap' (para encadenar Operaciones Async)
import { catchError, map, take, timeout, tap, switchMap } from 'rxjs/operators';
import { CountryStorageService } from '../storage/country-storage.service';
import { firstValueFrom } from 'rxjs';

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
    userRole: 'admin' | 'owner',
    roleRecurrent: string,
    access_days: string,
  ): Promise<void> {
    const fd = new FormData();
    fd.append('id_property', String(id_property));
    fd.append('guest_name', String(name));
    fd.append('guest_lastname', String(lastname));
    fd.append('dni', String(dni));
    fd.append('roleRecurrent', String(roleRecurrent));
    fd.append('access_days', String(access_days));

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
      //this.router.navigate(['/admin/country-recurrents']); //Corregir: tiene que navegar al propietario. 
    });
  }

  
  // READ (listados)
  
  // ❌ MÉTODO ORIGINAL (Problema: Devuelve Promise<Observable<...>>)
  /*   async getRecurrentsByCountry(): Promise<Observable<RecurrentsInterface[]>> {
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
  */

  getRecurrentsByCountry(): Observable<RecurrentsInterface[]> {
    if (this.SAFE_MODE) {
      console.warn('[recurrents] SAFE_MODE habilitado → devolviendo []');
      return of([]);
    }

    // Convertimos la Promise del storage a un Observable con 'from'.
    return from(this.countryStorage.getCountry().catch(() => null)).pipe(
        // Usamos switchMap para esperar la resolución del ID antes de hacer la llamada HTTP.
        switchMap(c => {
            const id = c?.id;
            if (!id) {
                console.warn('[recurrents] No hay country en storage → []');
                return of([]); // Devuelve un Observable<[]> si no hay ID
            }
    
            const url = `${environment.URL}/api/recurrents/get-by-country/${id}`;
            console.log('[recurrents] GET', url);
    
            // Se retorna el Observable de la llamada HTTP
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
        }),
        // Maneja cualquier error residual de la promesa inicial
        catchError(() => of([]))
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
  /**
     * Nuevo método para obtener los recurrentes por ID de Propietario (Owner).
     * Mapea al endpoint: GET /api/recurrents/get-by-owner/:id_owner
     */
    getRecurrentsByOwner(id_owner: number): Observable<RecurrentsInterface[]> {
        if (this.SAFE_MODE) {
            console.warn('[recurrents] SAFE_MODE habilitado → devolviendo []');
            return of([]);
        }

        if (!id_owner) {
            console.warn('[recurrents] ID de propietario es nulo/inválido → devolviendo []');
            return of([]);
        }

        // Construcción de la URL con el nuevo endpoint
        const url = `${environment.URL}/api/recurrents/get-by-owner/${id_owner}`;
        console.log('[recurrents] GET', url);

        return this.http.get<RecurrentsInterface[]>(url).pipe(
            timeout(this.HTTP_TIMEOUT_MS),
            take(1),
            map(list => list ?? []), // Asegura que si la respuesta es nula, devuelve un array vacío
            tap(list => console.log('[recurrents] getRecurrentsByOwner OK, items:', list.length)),
            catchError((err) => {
                console.error('[recurrents] getRecurrentsByOwner ERROR', err);
                // Aquí podrías mostrar una alerta, pero por lo general en listados solo se devuelve []
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

  // UPDATE (campos)
  updateRecurrent(id: number, payload: {
    id_property: number | string;
    guest_name: string;
    guest_lastname: string;
    dni: string | number;
    roleRecurrent?: string;
    access_days?: string;
    status?: boolean;
  }) {
    const url = `${environment.URL}/api/recurrents/${id}`;
    // Enviar como JSON para compatibilidad con el parser del backend
    const body: any = {
      id_property: payload.id_property,
      guest_name: payload.guest_name,
      guest_lastname: payload.guest_lastname,
      dni: payload.dni,
    };
    if (payload.roleRecurrent != null) body.roleRecurrent = payload.roleRecurrent;
    if (payload.access_days != null) body.access_days = payload.access_days;
    if (payload.status !== undefined) body.status = payload.status;

    return this.http.patch(url, body, { responseType: 'text' as 'json' }).pipe(
      timeout(this.HTTP_TIMEOUT_MS),
      take(1),
      tap(() => console.log('[recurrents] updateRecurrent OK')),
      catchError(err => {
        console.error('[recurrents] updateRecurrent ERROR', err);
        return of(null);
      })
    );
  }

  // UPDATE (status only)
  patchStatus(recurrentId: number | string, newStatus: boolean) {
    const url = `${environment.URL}/api/recurrents/${recurrentId}`;
    console.log('[recurrents] PATCH status', url, '→', newStatus);

    // Enviar como JSON
    return this.http.patch(url, { status: newStatus }, { responseType: 'text' as 'json' }).pipe(
      timeout(this.HTTP_TIMEOUT_MS),
      take(1),
      tap(() => console.log('[recurrents] patchStatus OK')),
      catchError(err => {
        console.error('[recurrents] patchStatus ERROR', err);
        return of(null);
      })
    );
  }

  // DELETE (hard delete)
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