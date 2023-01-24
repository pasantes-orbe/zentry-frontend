import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { Router } from '@angular/router';
import { CheckInInterfaceResponse } from '../../interfaces/checkIn-interface';
import { CheckInOrOut } from '../../interfaces/checkInOrOut-interface';
import { Observable } from 'rxjs';
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


  async createCheckin(guest_name: string, guest_lastname: string, dni: any, id_owner: any, id_guard: any, income_date:any, details: any, transport: any, patent:any){


    console.log(guest_name, guest_lastname, dni, id_owner, id_guard, income_date, details, transport)
  
    const country = await this._countryStorageService.getCountry()
    const id_country = country.id.toString()

    const formData = new FormData();
    formData.append('guest_name', guest_name);
    formData.append('guest_lastname', guest_lastname);
    formData.append('DNI', dni);
    formData.append('id_owner', id_owner);
    formData.append('id_guard', id_guard);
    formData.append('id_country', id_country);
    formData.append('income_date', income_date);
    formData.append('details', details);
    formData.append('transport', transport);
    formData.append('patent', patent);

    await this._alertService.setLoading();

    this._http.post(`${environment.URL}/api/checkin`, formData).subscribe(async res => {
      console.log(res)
      this._socketService.notificarCheckIn(res['checkIn']) 
      await this._alertService.removeLoading();
      this._alertService.showAlert("¡Listo!", "El Check-in fue enviado con exito al propietario");
      this._router.navigate(['/vigiladores/home']);

    })
  }

  async createCheckInFromOwner(name: string, lastname: string, dni: any, income_date: any, id_owner: any){
    const formData = new FormData();
    formData.append('guest_name', name);
    formData.append('guest_lastname', lastname);
    formData.append('DNI', dni);
    formData.append('income_date', income_date);
    formData.append('id_owner', id_owner);
    formData.append('confirmed_by_owner', 'true');

    await this._alertService.setLoading();

    this._http.post(`${environment.URL}/api/checkin`, formData).subscribe(async res => {
      console.log(res)

      await this._alertService.removeLoading();
      this._alertService.showAlert("¡Listo!", "El Check-in fue realizado con exito");
      this._router.navigate(['/home/tabs/tab1']);
    })

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

getAllCheckInConfirmedByOwner(){
  return this._http.get<CheckInOrOut[]>(`${environment.URL}/api/checkin/confirmed`)

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

updateCheckInTrue(id:any){
  this._http.patch(`${environment.URL}/api/checkin/${id}`, {}).subscribe(res => console.log(res))
}

updateCheckOutTrue(id:any){
  this._http.patch(`${environment.URL}/api/checkin/checkout/${id}`, {}).subscribe(res => console.log(res))
}


}
