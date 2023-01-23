import { Component, OnInit } from '@angular/core';
import { CheckInOrOut } from 'src/app/interfaces/checkInOrOut-interface';
import { CheckInService } from 'src/app/services/check-in/check-in.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

@Component({
  selector: 'app-checkin-out-historial',
  templateUrl: './checkin-out-historial.page.html',
  styleUrls: ['./checkin-out-historial.page.scss'],
})
export class CheckinOutHistorialPage implements OnInit {

  public registers: Register[] = [];
  public checkIns: CheckInOrOut[] = []
  public icons = {
    checkIn: 'caret-forward-outline',
    checkOut: 'caret-back-outline',
    noCheckOut: 'close-circle-outline'
  }

  searchKey: string;

  constructor(private _checkInService: CheckInService,
              private _countryStorage: CountryStorageService
  ) { }

  async ngOnInit() {
    const country = await this._countryStorage.getCountry()
    const id_country = country.id
    
  }

  isEmptyObject(obj){
    return JSON.stringify(obj) === '{}'
  }

}



interface Register{

  checkIn: {
    DNI: any,
    guest_name: string,
    guest_lastname: string,
    details: string,
    check_in: boolean,
    check_out: boolean,
    confirmed_by_owner: boolean,
    id: any,
    id_country: any,
    id_guard: any,
    id_owner: any,
    income_date: Date,
    patent: string,
    transport: string
  },
  checkOut: {
    id?: number,
    name?: string,
    lastname?: string,
    fullname?: string,
    dni?: number,
    date?: string,
    time?: string
  }

}