import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';

//Interfaces y Servicios
import { CheckInOrOut } from '../../../interfaces/checkInOrOut-interface';
import { CheckInService } from '../../../services/check-in/check-in.service';
import { CheckoutService } from '../../../services/checkout/checkout.service';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

// Pipes
import { FilterByPipe } from 'src/app/pipes/filter-by.pipe';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    FilterByPipe
  ]
})
// Se implementa OnDestroy para limpiar la suscripción al socket cuando el componente se destruye.
export class CheckoutPage implements OnInit, OnDestroy {

  // CORRECCIÓN 1: Se cambian las propiedades a 'public' para que sean accesibles desde la plantilla.
  public checkOutList: CheckInOrOut[] = [];
  
  // CORRECCIÓN 2: Se declara la propiedad 'searchKey' que faltaba para el buscador.
  public searchKey: string = '';
  
  private socket: Socket;
  private socketSubscription: Subscription;

  constructor(
    private alertController: AlertController,
    private _checkInService: CheckInService,
    private _checkOutService: CheckoutService
  ) { }

  ngOnInit() {
    // La conexión al socket se realiza aquí, una sola vez.
    this.socket = io(environment.URL);
    this.listenForUpdates();
  }

  ionViewWillEnter() {
    // Se cargan los datos cada vez que se entra a la vista.
    this.loadCheckOutList();
  }

  // Se encapsula la lógica de carga en un método para reutilizarla.
  loadCheckOutList() {
    this._checkInService.getAllCheckoutFalse().subscribe(res => {
      this.checkOutList = res;
    });
  }

  // Se crea un método específico para escuchar los eventos del socket.
  listenForUpdates() {
    this.socket.on('notificacion-nuevo-confirmedByOwner', (payload) => {
      console.log('Notificación recibida:', payload);
      // Cuando llega una notificación, se recarga la lista.
      this.loadCheckOutList();
    });
  }

  public async checkOut(checkInData: CheckInOrOut, index: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar Check Out',
      message: `Persona: ${checkInData.guest_name}<br>DNI: ${checkInData.DNI}`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Check Out',
          // CORRECCIÓN 3: Se cambia el handler para usar async/await con try/catch.
          // Esto es necesario si los métodos del servicio devuelven Promesas en lugar de Observables.
          handler: async (data) => {
            try {
              // Se espera a que se cree el checkout.
              await this._checkOutService.createCheckout(checkInData.id, data.observation);
              
              // Si lo anterior tuvo éxito, se espera a que se actualice el check-in.
              await this._checkInService.updateCheckOutTrue(checkInData.id);
              
              // Si todo tuvo éxito, se elimina el elemento de la lista local.
              this.checkOutList.splice(index, 1);

            } catch (error) {
              console.error("Error en el proceso de check-out:", error);
              // Aquí podrías mostrar una alerta de error al usuario.
            }
          }
        }
      ],
      inputs: [
        {
          type: 'textarea',
          name: 'observation',
          placeholder: 'Añadir una observación:',
        },
      ],
    });

    await alert.present();
  }

  // Se desconecta del socket cuando el componente se destruye para evitar fugas de memoria.
  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
