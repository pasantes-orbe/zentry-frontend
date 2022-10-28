import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-check-in-and-check-out',
  templateUrl: './check-in-and-check-out.page.html',
  styleUrls: ['./check-in-and-check-out.page.scss'],
})
export class CheckInAndCheckOutPage implements OnInit {

  public registers: Register[] = [
    {
      checkIn: {
        id: 1,
        name: "Juan",
        lastname: "Perez",
        dni: 49788569,
        date: "27/10/2022",
        time: "07:25"
      },
      checkOut: {
        id: 1,
        name: "Juan",
        lastname: "Perez",
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
        dni: 40999888,
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
        dni: 40999888,
        date: "24/10/2022",
        time: "12:45"
      },
      checkOut: {
        id: 1,
        name: "Javier",
        lastname: "Bernal",
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

  constructor() {}

  ngOnInit() {
  }

  isEmptyObject(obj){
    return JSON.stringify(obj) === '{}'
  }

  search(event){
    
    const { value } = event.detail;

    const keyword = value.toLowerCase();
  
    console.log(keyword);

  }

}

interface Register{

  checkIn: {
    id: number,
    name: string,
    lastname: string,
    dni: number,
    date: string,
    time: string
  },
  checkOut: {
    id?: number,
    name?: string,
    lastname?: string,
    dni?: number,
    date?: string,
    time?: string
  }

}
