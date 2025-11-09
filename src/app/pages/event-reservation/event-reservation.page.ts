import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Componentes
import { NavbarBackComponent } from 'src/app/components/navbars/navbar-back/navbar-back.component';

//Interfaces y Servicios
import { InvitationsComponent } from 'src/app/components/invitations/invitations/invitations.component';
import { AmenitieInterface } from 'src/app/interfaces/amenitie-interface';
import { AmenitieService } from 'src/app/services/amenities/amenitie.service';
import { ReservationsService } from 'src/app/services/amenities/reservations.service';
import { OwnerStorageService } from '../../services/storage/owner-interface-storage.service';
import { OwnerResponse } from 'src/app/interfaces/ownerResponse-interface';


@Component({
  selector: 'app-event-reservation',
  templateUrl: './event-reservation.page.html',
  styleUrls: ['./event-reservation.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    NavbarBackComponent
  ]
})
export class EventReservationPage implements OnInit {
  // Usamos 'public' para acceder desde el template si fuera necesario.
  // Inicializamos con un array vacío.
  public amenities: AmenitieInterface[] = [];
  
  private formBuilder: FormBuilder;
  private form: FormGroup;

  public guests: any[] = []
  private owner: OwnerResponse | null = null;
  
  selectedDate: string = '';
  occupied: any[] = [];


  constructor(private modalCtrl: ModalController, 
    private reservationService: ReservationsService, 
    private alertController: AlertController, 
    private _amenitiesService: AmenitieService, 
    protected _formBuilder: FormBuilder, 
    private _reservationsService: ReservationsService,
    private alertCtrl: AlertController,
    private OwnerStorageService: OwnerStorageService
) {
    this.formBuilder = _formBuilder;
    this.form = this.createForm();
  }

  ngOnInit() {
    // CORRECCIÓN CLAVE: El servicio ahora devuelve Observable<...> directamente,
    // por lo que usamos .subscribe() en lugar de .then(...).
    this._amenitiesService.getAllByOwner().subscribe(
      amenities => {
        this.amenities = amenities;
        console.log('Amenities cargados:', amenities);
      },
      error => {
        console.error('Error al cargar amenities para EventReservation:', error);
        // Podrías mostrar una alerta de error aquí si es necesario
      }
    );
  }

  ionViewWillEnter() {
    // Es buena práctica llamar al método que carga los datos, en lugar de ngOnInit()
    this.ngOnInit() 
  }
  onDateSelected(event: any) {
    this.selectedDate = event.detail.value;

    const amenityID = this.getForm().get('amenitieID')?.value;
    
    if (!amenityID) {
      console.warn("⚠ Primero selecciona un Amenity");
      return;
    }

    this._reservationsService.getOccupied(amenityID, this.selectedDate)
      .subscribe((res) => {
        this.occupied = res;
        console.log("⛔ Horarios ocupados:", this.occupied);
      });
  }


  async reservation() {
    // Este método está incompleto, pero asumimos que es para mostrar una alerta de éxito
    const alert = await this.alertController.create({
      header: 'Solicitud Enviada',
      message: 'El estado de reserva permanecerá como "Pendiente" hasta que el administrador confirme la disponibilidad.',
      buttons: ['OK'],
    });

    await alert.present();

  }


  public createForm(): FormGroup {
    return this.formBuilder.group({
      amenitieID: ['', [Validators.required]],
      fecha: ['', [Validators.required]],
      detalles: ['', [Validators.required]]
    });
  }

  public getForm(): FormGroup {
    return this.form;
  }

  async onDateChange(event: any) {
  const value = event?.detail?.value;
  this.selectedDate = value;

  const amenityID = this.getForm().get('amenitieID')?.value;
  if (!amenityID || !value) return;

  this._reservationsService.getReservationsByAmenityAndDate(amenityID, value)
    .subscribe((occupied) => {
      this.occupied = occupied;
      console.log("⛔ Horarios ocupados:", occupied);
      
      if (occupied.length > 0) {
        this.alertCtrl.create({
          header: 'Horario No Disponible',
          message: 'Ya existe una reserva activa en este horario.',
          buttons: ['OK']
        }).then(a => a.present());
      }
    });
}


  public saveAmenitie() {
  const rawGuests = Array.isArray(this.guests) ? this.guests : [];
  const normalizedGuests = rawGuests
    .map(g => ({
      nombre: String(g?.nombre ?? '').trim(),
      apellido: String(g?.apellido ?? '').trim(),
      dni: String(g?.dni ?? '').trim()
    }))
    .filter(g => g.nombre && g.apellido && g.dni);

  const reservationData = {
    id_amenity: this.getForm().get('amenitieID')?.value,
    date: this.getForm().get('fecha')?.value,
    details: this.getForm().get('detalles')?.value,
    guests: normalizedGuests
  };

  console.log('FRONTEND: Enviando datos de reserva:', reservationData);

  this._reservationsService.createReservation(reservationData).subscribe({
    next: async () => {
      const alert = await this.alertController.create({
        header: 'Solicitud Enviada',
        message: 'Tu reserva fue enviada al administrador.',
        buttons: ['OK']
      });
      await alert.present();
    },
    error: async (err) => {
      const alert = await this.alertController.create({
        header: 'Error',
        message: err?.error?.msg || 'No se pudo crear la reserva.',
        buttons: ['OK']
      });
      await alert.present();
      }
    });
  }


  addGuest() {
    this.guests.push({
      nombre: "",
      apellido: "",
      dni: null
    })
  }
}