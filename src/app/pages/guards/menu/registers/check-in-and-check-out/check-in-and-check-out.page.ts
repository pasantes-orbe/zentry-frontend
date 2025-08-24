import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

//CComponentes
import { NavbarBackComponent } from 'src/app/components/navbars/navbar-back/navbar-back.component';

// Pipes
import { FilterByPipe } from 'src/app/pipes/filter-by.pipe';

@Component({
  selector: 'app-check-in-and-check-out',
  templateUrl: './check-in-and-check-out.page.html',
  styleUrls: ['./check-in-and-check-out.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    NavbarBackComponent,
    FilterByPipe
  ]
})
export class CheckInAndCheckOutPage implements OnInit {

  public registers: Register[] = [
    {
      checkIn: {
        id: 1,
        name: "Juan",
        lastname: "Perez",
        fullname : "Juan Perez",
        dni: 49788569,
        date: "27/07/2025",
        time: "07:25"
      },
      checkOut: {
        id: 1,
        name: "Juan",
        lastname: "Perez",
        fullname : "Juan Perez",
        dni: 49788569,
        date: "27/07/2025",
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
        date: "24/07/2025",
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
        date: "24/07/2025",
        time: "12:45"
      },
      checkOut: {
        id: 1,
        name: "Javier",
        lastname: "Bernal",
        fullname : "Javier Bernal",
        dni: 40999888,
        date: "24/07/2025",
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

  constructor() {}

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
