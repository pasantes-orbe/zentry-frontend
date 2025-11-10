// src/app/services/amenities/amenitie.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { CountryStorageService } from '../storage/country-storage.service';
import { AmenitieInterface } from '../../interfaces/amenitie-interface';
import { from, map, Observable, switchMap } from 'rxjs';
import { OwnerStorageService } from '../storage/owner-interface-storage.service';

interface AmenityApiResponse {
  data?: AmenitieInterface[];
  amenities?: AmenitieInterface[];
}

@Injectable({
  providedIn: 'root'
})
export class AmenitieService {

  constructor(
    private _http: HttpClient,
    private _ownerStorageService: OwnerStorageService,
    private _alertService: AlertService,
    private _router: Router,
    private _countryStorageService: CountryStorageService
  ) {}

  // 🔹 Crear nuevo amenity
  async addAmenitiy(
    name: string,
    address: string,
    avatar: File,
    guests?: Array<{ nombre: string; apellido: string; dni: string }>
  ) {
    const country = await this._countryStorageService.getCountry().catch(() => null as any);
    const countryID = country?.id;
    if (!countryID) {
      await this._alertService.showAlert('¡Ooops!', 'No se encontró el país seleccionado. Vuelve al dashboard del país e inténtalo otra vez.');
      this._router.navigate(['/admin/home']);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('address', address);
    formData.append('avatar', avatar);
    if (guests && Array.isArray(guests) && guests.length > 0) {
      formData.append('guests', JSON.stringify(guests));
    }

    await this._alertService.setLoading();

    this._http.post(`${environment.URL}/api/amenities/country/${countryID}`, formData)
      .subscribe(
        async (res) => {
          console.log(res);
          await this._alertService.removeLoading();
          this._alertService.showAlert("¡Listo!", "El Lugar de Reserva se agregó con éxito");
          this._router.navigate(['/admin/view-all-amenities'], { replaceUrl: true });
        },
        async (err) => {
          console.error("Error al agregar amenity:", err);
          await this._alertService.removeLoading();

          if (err.status === 0) {
            await this._alertService.showAlert("Por favor subí una foto desde tu galería o archivos!", ``);
          } else {
            await this._alertService.showAlert("¡Ooops!", `${err.error?.msg || 'Error al crear el amenity'}`);
            this._router.navigate(['/admin/view-all-amenities'], { replaceUrl: true });
          }
        }
      );
  }

  // 🔹 Obtener todas las amenities por país
  public async getAll(): Promise<Observable<AmenitieInterface[]>> {
    const country = await this._countryStorageService.getCountry();
    const countryID = country.id;
    return this._http.get<AmenitieInterface[]>(`${environment.URL}/api/amenities/country/${countryID}`);
  }

  // 🔹 Actualizar amenity
  public async updateAmenity(amenityId: number, name: string, address: string, avatar?: File | string) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('address', address);

    if (avatar instanceof File) {
      formData.append('avatar', avatar);
    }

    await this._alertService.setLoading();

    this._http.patch(`${environment.URL}/api/amenities/${amenityId}`, formData)
      .subscribe(
        async () => {
          await this._alertService.removeLoading();
          this._alertService.showAlert("¡Actualizado!", "El Lugar de Reserva se modificó con éxito");
        },
        async (err) => {
          console.error("Error al actualizar amenity:", err);
          await this._alertService.removeLoading();
          this._alertService.showAlert("¡Ooops!", `${err.error?.msg || 'Error al actualizar el amenity.'}`);
        }
      );
  }

  // 🔹 Eliminar amenity
  public deleteAmenity(amenityId: number): Observable<any> {
    return this._http.delete(`${environment.URL}/api/amenities/${amenityId}`);
  }

  // 🔹 Obtener amenities del propietario (owner)
  public getAllByOwner(): Observable<AmenitieInterface[]> {
    return from(this._ownerStorageService.getOwner()).pipe(
      switchMap(owner => {
        if (owner && owner.property) {
          const countryID = owner.property.id_country;
          return this.fetchAmenities(countryID);
        } else {
          return from(this._countryStorageService.getCountry()).pipe(
            switchMap(country => this.fetchAmenities(country.id))
          );
        }
      })
    );
  }

  // 🔹 Llamada interna para obtener amenities asegurando que sea array
  private fetchAmenities(countryID: number): Observable<AmenitieInterface[]> {
    return this._http
      .get<AmenityApiResponse | AmenitieInterface[]>(`${environment.URL}/api/amenities/country/${countryID}`)
      .pipe(
        map(response => {
          if (Array.isArray(response)) return response;
          if (Array.isArray((response as AmenityApiResponse).data)) return (response as AmenityApiResponse).data!;
          if (Array.isArray((response as AmenityApiResponse).amenities)) return (response as AmenityApiResponse).amenities!;
          console.warn('API returned an unexpected structure for amenities list. Assuming empty array.', response);
          return [];
        })
      );
  }

  // 🔹 Obtener amenities por ID de country directamente (uso general)
  public getAmenitiesByCountry(idCountry: number): Observable<AmenitieInterface[]> {
    return this._http
      .get<any>(`${environment.URL}/api/amenities/country/${idCountry}`)
      .pipe(
        map(res => {
          if (Array.isArray(res)) return res;
          console.warn('Esperaba array de amenities, llegó:', res);
          return [];
        })
      );
  }
}
