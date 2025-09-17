//src/app/tab1/tab1.page.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importado para la navegación

// Usar componentes standalone en lugar de IonicModule
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonAvatar, IonGrid, IonRow, IonCol, IonItem, IonInput, 
  IonList, IonModal, IonSelect, IonSelectOption, IonDatetime, IonCheckbox, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';

// Servicios
import { UserStorageService } from '../services/storage/user-storage.service';
import { OwnerStorageService } from '../services/storage/owner-interface-storage.service';
import { OwnersService } from '../services/owners/owners.service';
import { OwnerResponse } from '../interfaces/ownerResponse-interface';
import { AlertService } from '../services/helpers/alert.service';
import { ReservationsService } from '../services/amenities/reservations.service'; 

// Componentes
import { ReservationsComponent } from '../components/reservations/reservations.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonIcon, IonAvatar, IonGrid, IonRow, IonCol, IonItem, IonInput,
    IonList, IonModal, IonSelect, IonSelectOption, IonDatetime, IonCheckbox,
    IonRefresher, IonRefresherContent
  ]
})
export class Tab1Page implements OnInit {
  
  private loading: boolean = true;
  private userID: any;
  protected owner: OwnerResponse | null = null;
  
  // Variables para el formulario
  public guestName: string = '';
  public guestDNI: string = '';

  // Variables para modals
  public isReservationModalOpen = false;
  public isRecurrentModalOpen = false;

  // Variables para reserva de amenity
  public selectedAmenity: string = '';
  public selectedDate: string = '';
  public selectedTime: string = '';
  
  // Mapeo de nombres de amenities a IDs
  // NOTA: Este mapa es una 'traducción' para que el front
  // sepa qué ID enviar al backend para cada nombre.
  private amenityIdMap: { [key: string]: number } = {
    'Cancha de Fútbol': 1,
    'SUM': 2, 
    'Cancha de Básquet': 3,
    'Campo de Golf': 4,
    'Quincho/Piscina': 5,
    //Original:
    //SUM,
    //Cancha de Fútbol,
    //Cancha de Básquet,
    //Campo de Golf,
    //Quincho/Piscina
  };

  public amenities = Object.keys(this.amenityIdMap);

  // Variables para recurrentes
  public recurrentName: string = '';
  public recurrentDNI: string = '';
  public recurrentRole: string = '';
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

  // Lista de recurrentes registrados
  public registeredRecurrents = [
    { id: 1, name: 'María Gómez', dni: '12345678', role: 'Empleada doméstica', days: ['lunes', 'miercoles', 'viernes'] },
    { id: 2, name: 'Carlos Ruiz', dni: '87654321', role: 'Jardinero', days: ['martes'] },
    { id: 3, name: 'Ana Torres', dni: '11223344', role: 'Niñera', days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'] }
  ];

  @ViewChild('reservationsComponent') reservationsComponent!: ReservationsComponent;

  constructor(
    private _userStorageService: UserStorageService,
    private _ownerStorageService: OwnerStorageService,
    private _ownersService: OwnersService,
    private alerts: AlertService,
    private _reservationsService: ReservationsService,
    private router: Router // Inyectado para la navegación
  ) {
    this.setLoading(true);
  }

  async ngOnInit() {
    try {
      const user = await this._userStorageService.getUser();
      if (user) {
        this.userID = user.id;
        this._ownersService.getByID(this.userID).subscribe({
          next: (owner) => {
            this.owner = owner;
            this._ownerStorageService.saveOwner(owner);
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

  async ionViewWillEnter() {
    if (this.reservationsComponent) {
      // await this.reservationsComponent.ngOnInit();
    }
  }

  // Función para autorizar visita rápida
  public authorizeQuickVisit() {
    if (!this.guestName.trim() || !this.guestDNI.trim()) {
      this.alerts.showAlert('Error', 'Nombre y DNI son obligatorios');
      return;
    }
    this.alerts.showAlert('Visita Autorizada', `Visita autorizada para:<br><strong>${this.guestName}</strong><br>DNI: ${this.guestDNI}`);
    this.guestName = '';
    this.guestDNI = '';
  }

  // Función para mostrar notificaciones
  public onNotificationClick() {
    const notifications = [
      { id: 1, type: 'visit', message: 'Juan Pérez solicitó acceso', time: '10:30 AM' },
      { id: 2, type: 'delivery', message: 'Paquete entregado en recepción', time: '09:15 AM' },
      { id: 3, type: 'maintenance', message: 'Mantenimiento programado mañana', time: 'Ayer' }
    ];
    let message = '<strong>Notificaciones Recientes:</strong><br><br>';
    notifications.forEach(notif => {
      const icon = notif.type === 'visit' ? '👤' : notif.type === 'delivery' ? '📦' : '🔧';
      message += `${icon} ${notif.message}<br><small style="color: #666;">${notif.time}</small><br><br>`;
    });
    this.alerts.showAlert('Notificaciones', message);
  }

  // Función para reservar amenity
  public reserveAmenity() {
    this.isReservationModalOpen = true;
  }

  // Confirmar reserva de amenity
  public async confirmReservation() { 
    if (!this.selectedAmenity || !this.selectedDate || !this.selectedTime) {
      this.alerts.showAlert('Error', 'Por favor complete todos los campos.');
      return;
    }
    
    // Obtener el ID del amenity del mapa
    const id_amenity = this.amenityIdMap[this.selectedAmenity];
    if (!id_amenity) {
      this.alerts.showAlert('Error', 'Amenity no válido.');
      return;
    }

    // Asegurarse de que el usuario está disponible antes de continuar
    if (!this.userID) {
      this.alerts.showAlert('Error', 'No se pudo obtener el ID del usuario. Por favor, intente de nuevo.');
      return;
    }
    
    // Construir la fecha y hora de manera robusta
    const dateObj = new Date(this.selectedDate);
    const [hours, minutes] = this.selectedTime.split(':').map(Number);
    dateObj.setHours(hours, minutes, 0, 0);
    const combinedDateTime = dateObj.toISOString();

    // Preparamos los datos para enviar al servicio
    const reservationData = {
      id_amenity: id_amenity,
      id_user: this.userID,
      date: combinedDateTime
    };

    try {
      // Llamamos al servicio para crear la reserva
      await this._reservationsService.createReservation(reservationData);
      
      this.alerts.showAlert('Reserva Confirmada', `
        <strong>Amenity:</strong> ${this.selectedAmenity}<br>
        <strong>Fecha y Hora:</strong> ${new Date(combinedDateTime).toLocaleString()}
      `);
      this.closeReservationModal();
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      // Validamos si el error tiene una propiedad 'error' y 'errors'
      if (error && error.error && error.error.errors && error.error.errors.length > 0) {
        // Extraemos el primer mensaje de error y lo mostramos
        const errorMessage = error.error.errors[0].msg;
        this.alerts.showAlert('Error', errorMessage);
      } else {
        // Si el formato del error no es el esperado, mostramos un mensaje genérico
        this.alerts.showAlert('Error', 'Hubo un problema al crear la reserva. Intente de nuevo.');
      }
    }
  }

  // Cerrar modal de reserva
  public closeReservationModal() {
    this.isReservationModalOpen = false;
    this.selectedAmenity = '';
    this.selectedDate = '';
    this.selectedTime = '';
  }

  // Función para gestionar recurrentes - CORREGIDA
  public manageRecurrent() {
    this.isRecurrentModalOpen = true;
  }

  // Agregar recurrente
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

  // Eliminar recurrente
  public removeRecurrent(id: number) {
    this.registeredRecurrents = this.registeredRecurrents.filter(r => r.id !== id);
    this.alerts.showAlert('Recurrente Eliminado', 'El recurrente ha sido eliminado exitosamente');
  }

  // Cerrar modal de recurrentes
  public closeRecurrentModal() {
    this.isRecurrentModalOpen = false;
    this.clearRecurrentForm();
  }

  // Limpiar formulario de recurrentes
  private clearRecurrentForm() {
    this.recurrentName = '';
    this.recurrentDNI = '';
    this.recurrentRole = '';
    this.selectedDays = [];
  }

  // Manejar selección de días
  public onDayChange(day: string, event: any) {
    if (event.detail.checked) {
      this.selectedDays.push(day);
    } else {
      this.selectedDays = this.selectedDays.filter(d => d !== day);
    }
  }

  // Obtener días formateados
  public getFormattedDays(days: string[]): string {
    return days.map(day => {
      const dayObj = this.weekDays.find(d => d.value === day);
      return dayObj ? dayObj.label : day;
    }).join(', ');
  }

  protected doRefresh(event: any) {
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  private getData() {
    setTimeout(() => {
      this.setLoading(false);
    }, 3000);
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public setLoading(loading: boolean): void {
    this.loading = loading;
  }
}