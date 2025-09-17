import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Ionic standalone
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonAvatar, IonGrid, IonRow, IonCol, IonItem, IonInput,
  IonList, IonModal, IonSelect, IonSelectOption, IonDatetime, IonCheckbox, IonToggle
} from '@ionic/angular/standalone';

// Theme
import { ThemeService } from '../services/theme/theme.service';

// Servicios
import { UserStorageService } from '../services/storage/user-storage.service';
import { OwnerStorageService } from '../services/storage/owner-interface-storage.service';
import { OwnersService } from '../services/owners/owners.service';
import { OwnerResponse } from '../interfaces/ownerResponse-interface';
import { AlertService } from '../services/helpers/alert.service';

// Componentes
import { ReservationsComponent } from '../components/reservations/reservations.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonIcon, IonAvatar, IonGrid, IonRow, IonCol, IonItem, IonInput,
    IonList, IonModal, IonSelect, IonSelectOption, IonDatetime, IonCheckbox, IonToggle
  ]
})
export class Tab1Page implements OnInit {

  private loading = true;
  private userID: any;
  protected owner: OwnerResponse | null = null;

  // Form
  public guestName = '';
  public guestDNI = '';

  // Modals
  public isReservationModalOpen = false;
  public isRecurrentModalOpen = false;

  // Amenity
  public selectedAmenity = '';
  public selectedDate = '';
  public selectedTime = '';
  public amenities = ['SUM','Cancha de Fútbol','Cancha de Básquet','Campo de Golf','Quincho/Piscina'];

  // Recurrentes
  public recurrentName = '';
  public recurrentDNI = '';
  public recurrentRole = '';
  public selectedDays: string[] = [];
  public weekDays = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
  ];

  public registeredRecurrents = [
    { id: 1, name: 'María Gómez', dni: '12345678', role: 'Empleada doméstica', days: ['lunes','miercoles','viernes'] },
    { id: 2, name: 'Carlos Ruiz', dni: '87654321', role: 'Jardinero', days: ['martes'] },
    { id: 3, name: 'Ana Torres', dni: '11223344', role: 'Niñera', days: ['lunes','martes','miercoles','jueves','viernes'] }
  ];

  @ViewChild('reservationsComponent') reservationsComponent!: ReservationsComponent;

  constructor(
    private _userStorageService: UserStorageService,
    private _ownerStorageService: OwnerStorageService,
    private _ownersService: OwnersService,
    private alerts: AlertService,
    public theme: ThemeService // usar directo en template
  ) {
    this.setLoading(true);
    this.getData();
  }

  async ngOnInit() {
    // Inicializa el tema para propietario (cambiá el rol si esta página es para otro)
    this.theme.init('owner');

    try {
      const user = await this._userStorageService.getUser();
      if (user) {
        this.userID = user.id;
        this._ownersService.getByID(this.userID).subscribe({
          next: (owner) => {
            this.owner = owner;
            this._ownerStorageService.saveOwner(owner);
          },
          error: (error) => {
            console.error('Error loading owner:', error);
            this.owner = null;
          }
        });
      }
    } catch (error) {
      console.error('Error in ngOnInit:', error);
      this.owner = null;
    }
  }

  onThemeToggle(ev: any) {
    const checked = ev?.detail?.checked ?? (ev?.target as HTMLInputElement)?.checked ?? false;
    this.theme.set('owner', checked ? 'dark' : 'light'); // mismo rol que en init()
  }

  async ionViewWillEnter() {
    if (this.reservationsComponent) {
      // await this.reservationsComponent.ngOnInit();
    }
  }

  public authorizeQuickVisit() {
    if (!this.guestName.trim() || !this.guestDNI.trim()) {
      this.alerts.showAlert('Error', 'Nombre y DNI son obligatorios');
      return;
    }
    this.alerts.showAlert(
      'Visita Autorizada',
      `Visita autorizada para:<br><strong>${this.guestName}</strong><br>DNI: ${this.guestDNI}`
    );
    this.guestName = '';
    this.guestDNI = '';
  }

  public onNotificationClick() {
    const notifications = [
      { id: 1, type: 'visit', message: 'Juan Pérez solicitó acceso', time: '10:30 AM' },
      { id: 2, type: 'delivery', message: 'Paquete entregado en recepción', time: '09:15 AM' },
      { id: 3, type: 'maintenance', message: 'Mantenimiento programado mañana', time: 'Ayer' }
    ];
    let message = '<strong>Notificaciones Recientes:</strong><br><br>';
    notifications.forEach(n => {
      const icon = n.type === 'visit' ? '👤' : n.type === 'delivery' ? '📦' : '🔧';
      message += `${icon} ${n.message}<br><small style="color:#666;">${n.time}</small><br><br>`;
    });
    this.alerts.showAlert('Notificaciones', message);
  }

  public reserveAmenity() { this.isReservationModalOpen = true; }

  public confirmReservation() {
    if (!this.selectedAmenity || !this.selectedDate || !this.selectedTime) {
      this.alerts.showAlert('Error', 'Por favor complete todos los campos.');
      return;
    }
    let formattedDate = 'Fecha no válida';
    try {
      const d = new Date(this.selectedDate);
      if (!isNaN(d.getTime())) formattedDate = d.toLocaleDateString();
    } catch {}
    this.alerts.showAlert('Reserva Confirmada', `
      <strong>Amenity:</strong> ${this.selectedAmenity}<br>
      <strong>Fecha:</strong> ${formattedDate}<br>
      <strong>Hora:</strong> ${this.selectedTime}
    `);
    this.closeReservationModal();
  }

  public closeReservationModal() {
    this.isReservationModalOpen = false;
    this.selectedAmenity = '';
    this.selectedDate = '';
    this.selectedTime = '';
  }

  public manageRecurrent() { this.isRecurrentModalOpen = true; }

  public addRecurrent() {
    if (!this.recurrentName.trim() || !this.recurrentDNI.trim() || !this.recurrentRole.trim() || this.selectedDays.length === 0) {
      this.alerts.showAlert('Error', 'Por favor complete todos los campos');
      return;
    }
    const newRecurrent = {
      id: this.registeredRecurrents.length + 1,
      name: this.recurrentName,
      dni: this.recurrentDNI,
      role: this.recurrentRole,
      days: [...this.selectedDays]
    };
    this.registeredRecurrents.push(newRecurrent);
    this.alerts.showAlert('Recurrente Agregado', `${this.recurrentName} ha sido agregado exitosamente`);
    this.clearRecurrentForm();
  }

  public removeRecurrent(id: number) {
    this.registeredRecurrents = this.registeredRecurrents.filter(r => r.id !== id);
    this.alerts.showAlert('Recurrente Eliminado', 'El recurrente ha sido eliminado exitosamente');
  }

  public closeRecurrentModal() {
    this.isRecurrentModalOpen = false;
    this.clearRecurrentForm();
  }

  private clearRecurrentForm() {
    this.recurrentName = '';
    this.recurrentDNI = '';
    this.recurrentRole = '';
    this.selectedDays = [];
  }

  public onDayChange(day: string, event: any) {
    if (event.detail.checked) this.selectedDays.push(day);
    else this.selectedDays = this.selectedDays.filter(d => d !== day);
  }

  public getFormattedDays(days: string[]): string {
    return days.map(day => this.weekDays.find(d => d.value === day)?.label ?? day).join(', ');
  }

  protected doRefresh(event: any) {
    setTimeout(() => event.target.complete(), 1000);
  }

  private getData() {
    setTimeout(() => this.setLoading(false), 3000);
  }

  public isLoading(): boolean { return this.loading; }
  public setLoading(loading: boolean): void { this.loading = loading; }
}
