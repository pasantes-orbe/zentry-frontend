//events-historial.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';

//Servicios
import { ReservationsService } from 'src/app/services/amenities/reservations.service';

//Interfaces
import { ReservationsInterface } from 'src/app/interfaces/reservations-interface';

//Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";
import { InvitationsComponent } from 'src/app/components/invitations/invitations/invitations.component';

//Pipes
import { FilterByPipe } from 'src/app/pipes/filter-by.pipe';

@Component({
  selector: 'app-events-historial',
  templateUrl: './events-historial.page.html',
  styleUrls: ['./events-historial.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,
    NavbarBackComponent,
    FilterByPipe
  ]

})
export class EventsHistorialPage implements OnInit {

  // CORRECCIÓN 1: Se declaran las propiedades como públicas y se inicializan.
  public reservations: ReservationsInterface[] = [];
  public loading: boolean = true; // Para mostrar un spinner mientras cargan los datos iniciales.

  // CORRECCIÓN 2: Se declara la propiedad 'searchKey' que faltaba para el buscador.
  public searchKey: string = '';

  // Se limpia el constructor para inyectar cada servicio una sola vez.
  constructor(
    private modalCtrl: ModalController,
    private _reservationsService: ReservationsService,
    private loadingCtrl: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadReservations();
  }

  ionViewWillEnter() {
    this.loadReservations();
  }

  // Se encapsula la lógica de carga en un método para reutilizarla.
  async loadReservations() {
    this.loading = true; // Muestra el spinner
    try {
      const reservationsObservable = await this._reservationsService.getAllByCountry();
      reservationsObservable.subscribe(reservations => {
        this.reservations = reservations;
        this.loading = false; // Oculta el spinner
      });
    } catch (error) {
      console.error("Error al cargar las reservaciones:", error);
      this.loading = false; // Oculta el spinner también en caso de error
    }
  }

  // CORRECCIÓN 3: Se mejora la lógica asíncrona para los loaders y toasts.
  public async resolverPeticion(status: boolean, reservationID: number) {
    const loading = await this.loadingCtrl.create({
      message: 'Cambiando estado de la reserva',
    });
    await loading.present();

    this._reservationsService.updateStatus(status, reservationID).subscribe({
      next: async (res) => {
        console.log(res);
        await this.loadReservations(); // Recarga la lista para mostrar el cambio
        await loading.dismiss();

        const toast = await this.toastController.create({
          message: 'El estado de la reserva se ha cambiado exitosamente!',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
      },
      error: async (err) => {
        console.error("Error al actualizar estado:", err);
        await loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Error al cambiar el estado de la reserva.',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async openModal(reservation: ReservationsInterface, index: number) {
    if (!reservation || !reservation.id) return;

    // Se usa el mismo servicio inyectado en el constructor.
    this._reservationsService.reservationGuests(reservation.id).subscribe(
      async guests => {
        console.log(guests);

        const modal = await this.modalCtrl.create({
          component: InvitationsComponent,
          mode: 'ios',
          componentProps: {
            guests: guests,
          }
        });
        await modal.present();

        const { data, role } = await modal.onWillDismiss();
      }
    );
  }
}
