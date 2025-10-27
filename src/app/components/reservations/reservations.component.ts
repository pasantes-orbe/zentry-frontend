// reservations.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';

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

  private loading = true;
  private data: any;

  // Observable reactivo para usar con el async pipe en la vista
  protected reservations$!: Observable<ReservationsInterface[]>;

  constructor(
    public Navigation: NavigationService,
    private _reservationsService: ReservationsService
  ) {
    this.setLoading(true);
    this.loadData();
  }

  async ngOnInit() {
    // 1) Obtener el Observable del servicio
    this.reservations$ = this._reservationsService.getReservationsByOwner();

    // 2) Forzar la primera carga (por si no se hizo en otra parte)
    void this._reservationsService.loadOwnerReservations();

    // 3) Ocultar el spinner local una vez que el Observable esté listo
    this.setLoading(false);
  }

  private loadData(): void {
    // Simulación de carga local; puedes eliminarlo si ya no lo necesitas
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
