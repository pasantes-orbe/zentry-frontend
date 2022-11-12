import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-checkin-out-historial',
  templateUrl: './checkin-out-historial.page.html',
  styleUrls: ['./checkin-out-historial.page.scss'],
})
export class CheckinOutHistorialPage implements OnInit {

  public registers: Register[] = [
    {
      checkIn: {
        id: 1,
        name: "Juan",
        lastname: "Perez",
        fullname : "Juan Perez",
        dni: 49788569,
        date: "27/10/2022",
        time: "07:25"
      },
      checkOut: {
        id: 1,
        name: "Juan",
        lastname: "Perez",
        fullname : "Juan Perez",
        dni: 49788569,
        date: "27/10/2022",
        time: "18:15"
      }
    },
    {
      checkIn: {
        id: 1,
        name: "Ludmila",
        lastname: "Gomez",
        fullname : "Ludmila Gomez",
        dni: 40999887,
        date: "24/10/2022",
        time: "12:45"
      },
      checkOut: {}
    },
    {
      checkIn: {
        id: 1,
        name: "Javier",
        lastname: "Bernal",
        fullname : "Javier Bernal",
        dni: 40999888,
        date: "24/10/2022",
        time: "12:45"
      },
      checkOut: {
        id: 1,
        name: "Javier",
        lastname: "Bernal",
        fullname : "Javier Bernal",
        dni: 40999888,
        date: "24/10/2022",
        time: "20:30"
      }
    }
    
  ];

  public icons = {
    checkIn: 'caret-forward-outline',
    checkOut: 'caret-back-outline',
    noCheckOut: 'close-circle-outline'
  }

  searchKey: string;

  constructor() { }

  ngOnInit() {
  }

  isEmptyObject(obj){
    return JSON.stringify(obj) === '{}'
  }

}

interface Register{

  checkIn: {
    id: number,
    name: string,
    lastname: string,
    fullname: string,
    dni: number,
    date: string,
    time: string
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