import { Component, Input, OnInit } from '@angular/core';
import { NavigationService } from 'src/app/helpers/navigation.service';
import { ReservationsInterface } from 'src/app/interfaces/reservations-interface';
import { ReservationsService } from 'src/app/services/amenities/reservations.service';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit {

  private loading: boolean;
  private data: any;
  protected reservations: ReservationsInterface[]

  constructor(private Navigation: NavigationService, private _reservationsService: ReservationsService) {
    this.setLoading(true);
    this.loadData();
  }

  ngOnInit() {
    this._reservationsService.getAllByUser().then(data => data.subscribe(reservations => {
      this.reservations = reservations 
      this.reservations.sort()
      console.log(reservations)
    } ))
   }


  ionViewWillEnter(){
    this._reservationsService.getAllByUser().then(data => data.subscribe(reservations => {
      this.reservations = reservations
      this.reservations.sort()
      console.log(reservations)
    } ))
  }
  private loadData(): void{
    setTimeout(() => {
      this.setLoading(false);
    }, 3000);
  }

  public getData(): any {
    return this.data;
  }

  public setData(data: any): void {
    this.data = data;
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public setLoading(loading: boolean): void {
    this.loading = loading;
  }

}
