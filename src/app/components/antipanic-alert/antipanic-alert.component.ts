import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { io, Socket } from 'socket.io-client';
import moment from 'moment';

@Component({
  selector: 'app-antipanic-alert',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './antipanic-alert.component.html',
  styleUrls: ['./antipanic-alert.component.scss']
})
export class AntipanicAlertComponent implements OnInit {
  @Input() antipanicData: any;
  
  public details: string = '';
  public showDetailsForm: boolean = false;
  private socket: Socket;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private userStorage: UserStorageService,
    private toastCtrl: ToastController
  ) {
    this.socket = io(environment.URL);
  }

  ngOnInit() {
    // Reproducir sonido de alerta si es necesario
    this.playAlertSound();
  }

  private playAlertSound() {
    // Opcional: agregar sonido de alerta
    try {
      const audio = new Audio('assets/sounds/alert.mp3');
      audio.play().catch(err => console.log('No se pudo reproducir el sonido:', err));
    } catch (error) {
      console.log('Audio no disponible');
    }
  }

  public acknowledgeAlert() {
    this.showDetailsForm = true;
  }

  public async finishAlert() {
    if (!this.details.trim()) {
      console.warn('[AntipanicAlert] No se ingresaron detalles');
      return;
    }

    console.log('[AntipanicAlert] Finalizando antipánico:', this.antipanicData.id);
    console.log('[AntipanicAlert] Detalles:', this.details);

    const now = new Date();
    const finishAt = moment(now).format("YYYY-MM-DDThh:mm:ss-03:00");
    const guard = await this.userStorage.getUser();
    const guardId = guard.id;

    const payload = {
      details: this.details,
      finishAt,
      guardId
    };

    console.log('[AntipanicAlert] Enviando PUT a /api/antipanic/' + this.antipanicData.id, payload);

    this.http.put(`${environment.URL}/api/antipanic/${this.antipanicData.id}`, payload).subscribe(
      async res => {
        console.log('[AntipanicAlert] ✅ Respuesta del backend:', res);
        console.log('[AntipanicAlert] Emitiendo evento notificar-antipanico-finalizado');
        
        // Emitir evento WebSocket (puede fallar en el backend pero los datos ya están guardados)
        try {
          this.socket.emit('notificar-antipanico-finalizado', res);
        } catch (socketErr) {
          console.warn('[AntipanicAlert] Error al emitir evento WebSocket (datos guardados correctamente):', socketErr);
        }
        
        // Mostrar confirmación
        const toast = await this.toastCtrl.create({
          message: '✅ Antipánico finalizado correctamente',
          duration: 3000,
          color: 'success',
          position: 'top'
        });
        await toast.present();
        
        console.log('[AntipanicAlert] Cerrando modal');
        this.modalCtrl.dismiss({ finished: true, details: this.details });
      },
      async err => {
        console.error('[AntipanicAlert] ❌ Error al finalizar antipánico:', err);
        const toast = await this.toastCtrl.create({
          message: '❌ Error al guardar los detalles. Intente nuevamente.',
          duration: 4000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    );
  }

  public cancel() {
    if (!this.showDetailsForm) {
      this.modalCtrl.dismiss({ finished: false });
    }
  }
}
