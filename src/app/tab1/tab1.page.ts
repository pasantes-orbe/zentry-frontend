// src/app/tab1/tab1.page.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

// Ionic standalone
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonAvatar, IonGrid, IonRow, IonCol, IonItem, IonInput,
  IonList, IonModal, IonSelect, IonSelectOption, IonDatetime, IonCheckbox,
  IonToggle, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';

// Theme
import { ThemeService } from '../services/theme/theme.service';

// Servicios
import { UserStorageService } from '../services/storage/user-storage.service';
import { OwnerStorageService } from '../services/storage/owner-interface-storage.service';
import { OwnersService } from '../services/owners/owners.service';
import { OwnerResponse } from '../interfaces/ownerResponse-interface';
import { AlertService } from '../services/helpers/alert.service';
import { ReservationsService } from '../services/amenities/reservations.service';
import { CheckInService } from '../services/check-in/check-in.service';
import { RecurrentsService } from '../services/recurrents/recurrents.service';
import { RecurrentsInterface } from '../interfaces/recurrents-interface';

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
    IonList, IonModal, IonSelect, IonSelectOption, IonDatetime, IonCheckbox,
    IonToggle, IonRefresher, IonRefresherContent
  ]
})
export class Tab1Page implements OnInit {

  private loading = true;
  private userID: any;
  protected owner: OwnerResponse | null = null;

  // Form (Visita Rápida)
  public guestName = '';
  public guestLastname = '';
  public guestDNI = '';

  // Modals
  public isReservationModalOpen = false;
  public isRecurrentModalOpen = false;

  // Reserva de amenity
  public selectedAmenity: string = '';
  public selectedDate: string = '';
  public selectedTime: string = '';

  private amenityIdMap: { [key: string]: number } = {
    'Cancha de Fútbol': 1,
    'SUM': 2,
    'Cancha de Básquet': 3,
    'Campo de Golf': 4,
    'Quincho/Piscina': 5,
  };
  public amenities = Object.keys(this.amenityIdMap);

  // Recurrentes (Formulario de Gestión)
  public recurrentName = '';
  public recurrentLastname = '';
  public recurrentDNI = '';
  public roleRecurrent = '';
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

  // Lista de recurrentes. Usa la interfaz real y se carga del backend.
  public registeredRecurrents: RecurrentsInterface[] = [];  
  
  @ViewChild('reservationsComponent') reservationsComponent!: ReservationsComponent;

  constructor(
    private _userStorageService: UserStorageService,
    private _ownerStorageService: OwnerStorageService,
    private _ownersService: OwnersService,
    private alerts: AlertService,
    public theme: ThemeService,
    private _reservationsService: ReservationsService,
    private _checkInService: CheckInService,
    private _recurrentsService: RecurrentsService,
  ) {
    this.setLoading(true); // Uso correcto de setLoading
  }

  // normaliza el shape del owner (se mantiene)
  private normalizeOwner(owner: OwnerResponse | null): OwnerResponse | null {
    if (!owner) { return null; }
    const normalized: any = { ...(owner as any) };
    if (normalized.id_user) {
        normalized.user = {
            id: normalized.id_user,
            ...(normalized.user || {})
        };
        delete normalized.id_user; 
    }
    const properties = Array.isArray(normalized.properties) ? normalized.properties : [];
    const property = normalized.property ?? properties[0] ?? null;
    if (property) {
      normalized.property = {
        ...property,
        id_country:
          property?.id_country !== undefined && property?.id_country !== null
            ? Number(property.id_country)
            : property?.id_country ?? null
      };
    }
    if (Array.isArray(properties)) {
      normalized.properties = properties.map((p: any) => ({
        ...p,
        id_country:
          p?.id_country !== undefined && p?.id_country !== null
            ? Number(p.id_country)
            : p?.id_country ?? null
      }));
    }
    return normalized as OwnerResponse;
  }

  // ngOnInit (se mantiene)
  async ngOnInit() {
    this.theme.init('owner');
    try {
      const user = await this._userStorageService.getUser();
      if (user) {
        this.userID = user.id;
        this._ownersService.getByID(this.userID).subscribe({
          next: (owner) => {
            const normalizedOwner = this.normalizeOwner(owner);
            this.owner = normalizedOwner;
            if (normalizedOwner) {
              void this._ownerStorageService.saveOwner(normalizedOwner);
            }
            this.setLoading(false);
          },
          error: (error) => {
            console.error('Error loading owner:', error);
            this.owner = null;
            this.setLoading(false);
          }
        });
      } else {
        this.setLoading(false);
      }
    } catch (error) {
      console.error('Error in ngOnInit:', error);
      this.owner = null;
      this.setLoading(false);
    }
  }

  // ensureOwnerContext (se mantiene)
  private async ensureOwnerContext() {
    try {
      if (this.owner?.user?.id && (this.owner as any)?.property?.id_country) {
        return;
      }
      const stored = await this._ownerStorageService.getOwner();
      if (stored) {
        this.owner = this.normalizeOwner(stored);
        if (this.owner?.user?.id && (this.owner as any)?.property?.id_country) {
          return;
        }
      }
      const user = await this._userStorageService.getUser();
      if (!user?.id) { throw new Error('Sin sesión de usuario'); }

      const owner = await firstValueFrom(this._ownersService.getByID(user.id));
      this.owner = this.normalizeOwner(owner);
      if (this.owner) {
        void this._ownerStorageService.saveOwner(this.owner);
      }
    } catch (error) {
      console.error('No se pudo cargar el owner:', error);
      this.owner = null;
    }
  }

  onThemeToggle(ev: any) {
    const checked = ev?.detail?.checked ?? (ev?.target as HTMLInputElement)?.checked ?? false;
    this.theme.set('owner', checked ? 'dark' : 'light');
  }

  async ionViewWillEnter() {
    if (this.reservationsComponent) {
      // await this.reservationsComponent.ngOnInit();
    }
  }

  // authorizeQuickVisit (se mantiene)
  public async authorizeQuickVisit() {
    if (!this.guestName.trim() || !this.guestLastname.trim() || !this.guestDNI.trim()) {
      await this.alerts.showAlert('Error', 'Nombre, Apellido y DNI son obligatorios');
      return;
    }

    if (isNaN(Number(this.guestDNI))) {
      await this.alerts.showAlert('Error', 'El DNI debe ser numérico.');
      return;
    }

    try {
      await this.ensureOwnerContext();

      if (!this.owner?.user?.id || !(this.owner as any)?.property?.id_country) {
        await this.alerts.showAlert('Error', 'No se pudo cargar tu perfil de propietario. Reingresá.');
        return;
      }

      const id_owner = this.owner.user.id;
      const id_country = (this.owner as any).property.id_country;
      const income_date = new Date().toISOString();

      await this._checkInService.createCheckInFromOwner(
        this.guestName.trim(),
        this.guestLastname.trim(),
        this.guestDNI.trim(),
        income_date,
        id_owner,
        id_country
      );

      await this.alerts.showAlert(
        'Visita Autorizada',
        `Visita autorizada para:<br><strong>${this.guestName} ${this.guestLastname}</strong><br>DNI: ${this.guestDNI}`
      );

      this.guestName = '';
      this.guestLastname = '';
      this.guestDNI = '';
    } catch (error: any) {
      console.error('Error al autorizar visita rápida:', error);
      let message = 'Ocurrió un error inesperado al autorizar la visita.';
      if (error?.error?.msg) { message = error.error.msg; }
      else if (error?.statusText) { message = `Error de red o conexión: ${error.statusText}`; }
      await this.alerts.showAlert('Error de Autorización', message);
    }
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

  // --- LÓGICA DE RESERVACION (se mantiene) ---
  public reserveAmenity() {
    this.isReservationModalOpen = true;
  }

  public async confirmReservation() {
    if (!this.selectedAmenity || !this.selectedDate || !this.selectedTime) {
      this.alerts.showAlert('Error', 'Por favor complete todos los campos.');
      return;
    }

    const id_amenity = this.amenityIdMap[this.selectedAmenity];
    if (!id_amenity) {
      this.alerts.showAlert('Error', 'Amenity no válido.');
      return;
    }

    if (!this.userID) {
      this.alerts.showAlert('Error', 'No se pudo obtener el ID del usuario.');
      return;
    }

    const dateObj = new Date(this.selectedDate);
    const [hours, minutes] = this.selectedTime.split(':').map(Number);
    dateObj.setHours(hours, minutes, 0, 0);
    const combinedDateTime = dateObj.toISOString();

    const reservationData = {
      id_amenity: id_amenity,
      id_user: this.userID,
      date: combinedDateTime
    };

    try {
      await this._reservationsService.createReservation(reservationData);
      this.alerts.showAlert('Reserva Confirmada', `
        <strong>Amenity:</strong> ${this.selectedAmenity}<br>
        <strong>Fecha y Hora:</strong> ${new Date(combinedDateTime).toLocaleString()}
      `);
      this.closeReservationModal();
    } catch (error: any) {
      console.error('Error al crear la reserva:', error);
      if (error?.error?.errors?.length > 0) {
        const msg = error.error.errors[0].msg;
        this.alerts.showAlert('Error', msg);
      } else {
        this.alerts.showAlert('Error', 'Hubo un problema al crear la reserva. Intente de nuevo.');
      }
    }
  }

  public closeReservationModal() {
    this.isReservationModalOpen = false;
    this.selectedAmenity = '';
    this.selectedDate = '';
    this.selectedTime = '';
  }
  
  // --- LÓGICA DE RECURRENTES (CORREGIDA) ---
  
  private async loadRecurrents() {
    await this.ensureOwnerContext();

    const ownerId = this.owner?.user?.id;
    if (!ownerId) {
        console.error('No se pudo obtener el ID del propietario para cargar recurrentes.');
        this.registeredRecurrents = [];
        return;
    }
    
    this._recurrentsService.getRecurrentsByOwner(ownerId).subscribe({
        next: (data) => {
            this.registeredRecurrents = data; 
        },
        error: (err) => {
            console.error('Error al cargar recurrentes:', err);
            this.alerts.showAlert('Error', 'No se pudo cargar la lista de invitados recurrentes.');
            this.registeredRecurrents = [];
        }
    });
  }

  public manageRecurrent() { 
    // Cargar la lista del backend antes de abrir
    void this.loadRecurrents(); 
    this.isRecurrentModalOpen = true; 
  }

  public async addRecurrent() { 
    // 1. Validar campos requeridos para la API (Name, Lastname, DNI)
    if (!this.recurrentName.trim() || !this.recurrentLastname.trim() || !this.recurrentDNI.trim()
      || !this.roleRecurrent.trim() || this.selectedDays.length === 0) 
    {
      await this.alerts.showAlert('Error', 'Nombre, Apellido y DNI son obligatorios');
      return;
    }

    // 2. Asegurar el contexto para obtener el ID de la Propiedad (id_property)
    await this.ensureOwnerContext();
    const id_property = (this.owner as any)?.property?.id; 

    if (!id_property) {
      await this.alerts.showAlert('Error', 'No se pudo obtener la propiedad del propietario. Reingresá.');
      return;
    }
    const daysString = this.selectedDays.join(',');

    try {
      await this._recurrentsService.addRecurrent(
            id_property,
            this.recurrentName.trim(),
            this.recurrentLastname.trim(),
            this.recurrentDNI.trim(),
            'owner',                      // userRole: 'owner' | 'admin'
            this.roleRecurrent.trim(),    // roleRecurrent: string
            daysString                    // access_days: string
        );
      /* 3. Llamar al servicio para persistir en el backend
      await this.recurrentsService.addRecurrent(
        id_property,
        this.recurrentName.trim(),
        this.recurrentLastname.trim(), 
        this.recurrentDNI.trim(),
        'owner'
      ));
      */
      // 4. Recargar la lista del backend
      void this.loadRecurrents();
      
      // 5. Limpiar el formulario
      this.clearRecurrentForm();
        this.recurrentName = '';
        this.recurrentLastname = '';
        this.recurrentDNI = '';
        this.roleRecurrent = ''; 
        this.selectedDays = [];  
    } catch (error) {
      console.error('Fallo al agregar recurrente:', error);
      this.alerts.showAlert('Error de Registro', 'No se pudo completar el registro del recurrente. Verifique los datos.');
    }
  }


  public async removeRecurrent(id: number) {
    try {
      await this.alerts.setLoading();
      
      // 1. Llamar al servicio para eliminar
      const result = await firstValueFrom(this._recurrentsService.deleteRecurrent(id));

      // 2. Si es exitoso, recargar la lista
      if (result) {
        await this.loadRecurrents(); 
        this.alerts.showAlert('Recurrente Eliminado', 'El recurrente ha sido eliminado exitosamente del sistema.');
      } else {
        this.alerts.showAlert('Error', 'No se pudo eliminar el recurrente. Intente de nuevo.');
      }
    } catch (error) {
      console.error('Error al eliminar recurrente:', error);
      this.alerts.showAlert('Error', 'Ocurrió un error inesperado al intentar eliminar.');
    } finally {
      await this.alerts.removeLoading();
    }
  }

  public closeRecurrentModal() {
    this.isRecurrentModalOpen = false;
    this.clearRecurrentForm();
  }

  private clearRecurrentForm() {
    this.recurrentName = '';
    this.recurrentLastname = '';
    this.recurrentDNI = '';
    this.roleRecurrent = '';
    this.selectedDays = [];
  }
  
  public onDayChange(day: string, event: any) {
    if (event.detail.checked) this.selectedDays.push(day);
    else this.selectedDays = this.selectedDays.filter(d => d !== day);
  }

  public getFormattedDays(days: string | string[] | null | undefined): string {

    if (!days) return 'No especificado';
    
    // 1. Convertir el string de días del backend a un array
    //const dayValues = days.split(',');
    const dayValues = Array.isArray(days) ? days : String(days).split(',');


    /* 2. Mapear los valores ('lunes') a sus etiquetas ('Lunes')
    return dayValues.map(dayValue => {
        // Buscar la etiqueta ('Lunes') que corresponde al valor ('lunes')
        const foundDay = this.weekDays.find(d => d.value === dayValue.trim());
        return foundDay ? foundDay.label : dayValue;
    }).join(', ');
    */
      return dayValues
    .map(d => d.trim())
    .filter(Boolean)
    .map(value => this.weekDays.find(w => w.value === value)?.label ?? value)
    .join(', ');
  }

  protected async doRefresh(event: any) {
    // Recargar Owner y Recurrentes al hacer pull-to-refresh
    await this.ensureOwnerContext(); 
    await this.loadRecurrents();
    event.target.complete();
  }

  // Funciones de control de carga
  public isLoading(): boolean { return this.loading; }
  public setLoading(loading: boolean): void { this.loading = loading; }
}