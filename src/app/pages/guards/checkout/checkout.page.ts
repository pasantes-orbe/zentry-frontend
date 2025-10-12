import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, IonicModule, FormsModule, FilterByPipe]
})
export class CheckoutPage implements OnInit, OnDestroy {
  // Estado público para template
  public checkOutList: CheckInOrOut[] = [];
  public searchKey = '';
  public isLoading = false;
  public isProcessingId: number | null = null;

  // Socket
  private socket!: Socket;
  private socketEventName = 'notificacion-nuevo-confirmedByOwner';
  private subs: Subscription[] = [];

  constructor(
    private alertController: AlertController,
    private _checkInService: CheckInService,
    private _checkOutService: CheckoutService
  ) {}

  ngOnInit() {
    // 1) Conecto socket una sola vez
    this.socket = io(environment.URL, { transports: ['websocket'] });

    // 2) Listeners de conexión/desconexión (opcional logging)
    this.socket.on('connect', () => console.log('[socket] conectado', this.socket.id));
    this.socket.on('disconnect', (reason) => console.log('[socket] desconectado:', reason));

    // 3) Escucho actualizaciones del backend
    this.listenForUpdates();
  }

  ionViewWillEnter() {
    this.loadCheckOutList();
  }

  // Carga de pendientes de checkout
  loadCheckOutList() {
    this.isLoading = true;
    const s = this._checkInService.getAllCheckoutFalse().subscribe({
      next: (res) => {
        this.checkOutList = res || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.presentSimpleAlert('No se pudo cargar la lista de check-outs pendientes.');
      }
    });
    this.subs.push(s);
  }

  // Socket -> refrescar lista cuando el owner confirma
  listenForUpdates() {
    this.socket.on(this.socketEventName, (payload: any) => {
      console.log('[socket]', this.socketEventName, payload);
      this.loadCheckOutList();
    });
  }

  // Confirmar y ejecutar checkout
  public async checkOut(checkInData: CheckInOrOut, index: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar Check Out',
      message: `Persona: <b>${checkInData.guest_name}</b><br>DNI: <b>${checkInData.DNI}</b>`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Check Out',
          handler: async (data) => {
            try {
              this.isProcessingId = checkInData.id as unknown as number;

              // 1) Crear checkout
              await this._checkOutService.createCheckout(checkInData.id, data?.observation ?? '');

              // 2) Marcar check-in como "checkout true"
              await this._checkInService.updateCheckOutTrue(checkInData.id);

              // 3) Remover local (optimista)
              this.checkOutList.splice(index, 1);

            } catch (error) {
              console.error('Error en proceso de check-out:', error);
              this.presentSimpleAlert('No se pudo completar el check-out. Intentalo nuevamente.');
            } finally {
              this.isProcessingId = null;
            }
          }
        }
      ],
      inputs: [
        {
          type: 'textarea',
          name: 'observation',
          placeholder: 'Añadir una observación (opcional)'
        }
      ]
    });

    await alert.present();
  }

  // Optimiza *ngFor
  public trackById(_: number, item: CheckInOrOut) {
    return item.id ?? item.DNI ?? item.guest_name;
  }

  private async presentSimpleAlert(message: string) {
    const a = await this.alertController.create({ header: 'Atención', message, buttons: ['OK'] });
    await a.present();
  }

  ngOnDestroy() {
    // Limpio suscripciones
    this.subs.forEach(s => s.unsubscribe());
    this.subs = [];

    // Limpio listeners y socket
    if (this.socket) {
      this.socket.off(this.socketEventName);
      this.socket.off('connect');
      this.socket.off('disconnect');
      this.socket.disconnect();
    }
  }
}
