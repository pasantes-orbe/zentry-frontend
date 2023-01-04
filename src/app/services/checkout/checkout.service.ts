import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(
    private _htpp :HttpClient
  ) { }


  createCheckout(checkin_id:any, details:any){

    console.log(checkin_id, details.observation)

    const formData = new FormData();
    formData.append('id_checkin', checkin_id);
    formData.append('details', details.observation);
    
    this._htpp.post(`${environment.URL}/api/checkout`, formData).subscribe(res => console.log(res))

  }
}
