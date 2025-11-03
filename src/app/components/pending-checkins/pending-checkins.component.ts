import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CheckInService } from 'src/app/services/check-in/check-in.service';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';

@Component({
  selector: 'app-pending-checkins',
  templateUrl: './pending-checkins.component.html',
  styleUrls: ['./pending-checkins.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PendingCheckinsComponent implements OnInit {

  @Input() ownerId: number | null = null;

  public checkIns: any[] = [];
  public loading = true;

  constructor(
    private checkInService: CheckInService,
    private alerts: AlertService,
    private notificationsService: NotificationsService // <-- ACÁ estaba faltando
  ) {}

  ngOnInit(): void {
    this.loadCheckIns();
  }

  /** Cargar check-ins del día del propietario (pendientes = confirmed_by_owner:false && check_out:false) */
  private loadCheckIns(): void {
    if (!this.ownerId) {
      console.warn('[PendingCheckins] No hay ownerId');
      this.loading = false;
      return;
    }

    this.checkInService.getAllCheckInTodayByOwnerID(this.ownerId).subscribe({
      next: (checkIns) => {
        console.log('[PendingCheckins] Total check-ins recibidos:', checkIns.length, checkIns);

        this.checkIns = (checkIns || []).filter((c: any) =>
          c?.confirmed_by_owner === false && c?.check_out === false
        );

        console.log('[PendingCheckins] Pendientes filtrados:', this.checkIns.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('[PendingCheckins] Error al cargar check-ins:', err);
        this.checkIns = [];
        this.loading = false;
      }
    });
  }

  /** Owner autoriza */
  public authorize(checkIn: any, index: number): void {
    console.log('[PendingCheckins] Autorizando:', checkIn);

    // 1) Confirmar por propietario (endpoint dedicado)
    this.checkInService.ownerConfirm(checkIn.id).subscribe({
      next: () => {
        // 2) Notificación al guardia (payload NUEVO del backend)
        if (checkIn?.id_guard) {
          this.notificationsService.createNotification({
            id_user: Number(checkIn.id_guard), // <-- clave correcta
            title: 'Ingreso autorizado',
            content: `${checkIn.guest_name} ${checkIn.guest_lastname} autorizado por propietario`,
            read: false
          }).subscribe({
            error: (err) => console.warn('[Notif] Error al guardar (no bloquea):', err)
          });
        }

        // 3) Sacar de la lista
        this.checkIns.splice(index, 1);

        this.alerts.showAlert(
          'Autorizado',
          `${checkIn.guest_name} ${checkIn.guest_lastname} fue autorizado correctamente`
        );
      },
      error: (err) => {
        console.error('[PendingCheckins] Error al autorizar:', err);
        this.alerts.showAlert('Error', 'No se pudo autorizar el ingreso');
      }
    });
  }

  /** Owner rechaza */
  public reject(checkIn: any, index: number): void {
    console.log('[PendingCheckins] Rechazando:', checkIn);

    // Si querés rechazo explícito, usá changeStatus/otro endpoint; por ahora lo saco de la lista.
    this.checkIns.splice(index, 1);
    this.alerts.showAlert('Rechazado', `${checkIn.guest_name} ${checkIn.guest_lastname} fue rechazado`);
  }

  /** Recargar desde fuera */
  public reload(): void {
    this.loading = true;
    this.loadCheckIns();
  }
}
