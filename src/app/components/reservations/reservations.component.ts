//reservations.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

// Servicios y otros
import { NavigationService } from 'src/app/helpers/navigation.service';
import { ReservationsInterface } from 'src/app/interfaces/reservations-interface';
import { ReservationsService } from 'src/app/services/amenities/reservations.service';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule
  ]
})
export class ReservationsComponent implements OnInit {

  private loading: boolean = true;
  private data: any;
  protected reservations: ReservationsInterface[] = [];

  constructor(
    public Navigation: NavigationService,
    private _reservationsService: ReservationsService
  ) {
    this.setLoading(true);
    this.loadData();
  }

  async ngOnInit() {
    try {
      const reservationsObservable = await this._reservationsService.getAllByUser();
      reservationsObservable.subscribe(reservations => {
        this.reservations = reservations;
        console.log("ESTAS SON LAS RESERVACIONES CREADAS POR EL USUARIO", reservations);
      });
    } catch (error) {
      console.error('Error loading reservations:', error);
    }
  }

  private loadData(): void {
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