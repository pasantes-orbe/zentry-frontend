import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Interfaces
import { CheckInOrOut } from 'src/app/interfaces/checkInOrOut-interface';

// Servicios
import { CheckInService } from 'src/app/services/check-in/check-in.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';

@Component({
  selector: 'app-services-pending',
  templateUrl: './services-pending.page.html',
  styleUrls: ['./services-pending.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class ServicesPendingPage implements OnInit, OnDestroy {

  public pendingServices: CheckInOrOut[] = [];
  public isLoading: boolean = true;
  public isProcessing: number | null = null;
  private countryId: number | null = null;
  private socketSub?: Subscription;

  constructor(
    private router: Router,
    private checkInService: CheckInService,
    private countryStorage: CountryStorageService,
    private webSocketService: WebSocketService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.loadCountry();
    this.loadPendingServices();
    this.listenToSocketUpdates();
  }

  ngOnDestroy() {
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
  }

  /**
   * Carga el country desde el storage
   */
  private async loadCountry() {
    const country = await this.countryStorage.getCountry();
    if (country) {
      this.countryId = country.id;
    }
  }

  /**
   * Carga los servicios pendientes de autorización
   */
  private loadPendingServices() {
    if (!this.countryId) {
      console.error('[ServicesPending] No hay country ID');
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    this.checkInService.getAllCheckInConfirmedByOwner(this.countryId).subscribe({
      next: (checkins) => {
        // Filtrar solo los que no tienen propietario (servicios)
        this.pendingServices = checkins.filter(c => c.id_owner === null);
        console.log('[ServicesPending] Servicios pendientes:', this.pendingServices.length);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[ServicesPending] Error al cargar servicios:', err);
        this.showToast('Error al cargar servicios pendientes', 'danger');
        this.isLoading = false;
      }
    });
  }

  /**
   * Escucha actualizaciones por socket
   */
  private listenToSocketUpdates() {
    // TODO: Implementar cuando WebSocketService tenga método listen()
    // Por ahora, recargar cada 30 segundos
    setInterval(() => {
      if (!this.isProcessing) {
        this.loadPendingServices();
      }
    }, 30000);
  }

  /**
   * Aprueba el ingreso de un servicio
   */
  public async approveService(service: CheckInOrOut) {
    const alert = await this.alertController.create({
      header: 'Autorizar Ingreso',
      message: `¿Confirmar ingreso de ${service.guest_name} ${service.guest_lastname}?\n\nDNI: ${service.DNI}\n${service.details || 'Servicio técnico'}`,
      cssClass: 'confirm-approve-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Autorizar',
          handler: () => {
            this.confirmApproval(service);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Confirma la aprobación del servicio
   */
  private confirmApproval(service: CheckInOrOut) {
    this.isProcessing = service.id;

    this.checkInService.updateCheckInTrue(service.id).then(
      (response) => {
        console.log('[ServicesPending] Servicio aprobado:', response);
        
        // Emitir evento por socket para notificar a otros
        const eventData = {
          id_checkin: service.id,
          guest_name: service.guest_name,
          guest_lastname: service.guest_lastname,
          approved_by: 'guard' // o 'admin' dependiendo del rol
        };
        
        this.webSocketService.emitirEvento('service-approved-by-guard', eventData);
        console.log('[ServicesPending] Evento service-approved-by-guard emitido:', eventData);
        
        this.showToast(`Ingreso autorizado: ${service.guest_name} ${service.guest_lastname}`, 'success');
        
        // Recargar lista y volver si no quedan más servicios
        this.loadPendingServices();
        this.isProcessing = null;
        
        // Si no quedan más servicios, volver al home
        setTimeout(() => {
          if (this.pendingServices.length === 0) {
            this.router.navigate(['/guards/home']);
          }
        }, 500);
      }
    ).catch(
      (error) => {
        console.error('[ServicesPending] Error al aprobar servicio:', error);
        this.showToast('Error al autorizar el ingreso', 'danger');
        this.isProcessing = null;
      }
    );
  }

  /**
   * Muestra un toast message
   */
  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }
}
