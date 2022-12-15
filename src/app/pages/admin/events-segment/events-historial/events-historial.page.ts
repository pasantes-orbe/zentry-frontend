import { Component, OnInit } from '@angular/core';
import { ReservationsInterface } from 'src/app/interfaces/reservations-interface';
import { ReservationsService } from 'src/app/services/amenities/reservations.service';

@Component({
  selector: 'app-events-historial',
  templateUrl: './events-historial.page.html',
  styleUrls: ['./events-historial.page.scss'],
})
export class EventsHistorialPage implements OnInit {

  reservations: ReservationsInterface[]
  protected loading: boolean
  constructor(private _reservationsService: ReservationsService) { }

  ngOnInit() {
    this._reservationsService.getAll().subscribe( reservations => this.reservations = reservations)
  }

  public resolverPeticion(status: boolean, reservationID: number){
    this._reservationsService.updateStatus(status, reservationID,).subscribe(res => console.log(res))
  }

  public isLoading(){
    return true
  }

  public stopLoading(){
    return false
  }
}
