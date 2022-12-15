import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { AmenitieInterface } from 'src/app/interfaces/amenitie-interface';
import { ReservationsInterface } from 'src/app/interfaces/reservations-interface';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { CountryStorageService } from '../storage/country-storage.service';
import { OwnerStorageService } from '../storage/owner-interface-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {

  constructor(private _http: HttpClient, private _alertService: AlertService, private _router: Router, private _ownerStorageService: OwnerStorageService) {

   }

   public async createReservation(id_amenity, date, details){
    const owner = await this._ownerStorageService.getOwner()
    const ownerID = owner.user.id
    const formData = new FormData();
    formData.append('id_user', ownerID.toString());
    formData.append('id_amenity', id_amenity);
    formData.append('date', date);
    formData.append('details', details);

    this._alertService.setLoading();

    this._http.post(`${environment.URL}/api/reservations`, formData).subscribe(res => {
      console.log(res);
      this._alertService.removeLoading();
      this._alertService.showAlert("¡Listo!", "La reserva del lugar fue exitosa");
      this._router.navigate([`/admin/ver-propiedades`]);
})

   }

   public async getAllByUser(): Promise<Observable<ReservationsInterface[]>> {
    const owner = await this._ownerStorageService.getOwner()
    const userID = owner.user.id

    return this._http.get<ReservationsInterface[]>(`${environment.URL}/api/reservations/${userID}`);
 }

  public getAll():Observable<ReservationsInterface[]>{
    return this._http.get<ReservationsInterface[]>(`${environment.URL}/api/reservations/`)
  }

  public updateStatus(status:boolean, reservationID: number){
    return this._http.patch(`${environment.URL}/api/reservations/${reservationID}/${status}`,{
    })
  }
}
