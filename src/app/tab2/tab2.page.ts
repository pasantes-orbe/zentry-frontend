import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componentes Standalone de Ionic
import { IonContent, IonIcon, IonFab, IonFabButton } from '@ionic/angular/standalone';

// Tu componente de mapa
import { CountryMapComponent } from '../components/maps/country-map/country-map.component';

// Servicios
import { AntipanicService } from '../services/antipanic/antipanic.service';
import { OwnerStorageService } from '../services/storage/owner-interface-storage.service';
import { UserStorageService } from '../services/storage/user-storage.service';
import { AlertService } from '../services/helpers/alert.service';

// Interfaces
import { OwnerResponse } from '../interfaces/ownerResponse-interface';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonFab,
    IonFabButton,
    CountryMapComponent
  ]
})
export class Tab2Page implements OnInit {
  @ViewChild('maps') maps: CountryMapComponent;
  
  public isPanicActive: boolean = false;
  public isLoading: boolean = false;
  private owner: OwnerResponse | null = null;
  private currentPanicId: string | null = null;

  constructor(
    private antipanicService: AntipanicService,
    private ownerStorage: OwnerStorageService,
    private userStorage: UserStorageService,
    private alertService: AlertService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      // Cargar datos del propietario
      this.owner = await this.ownerStorage.getOwner();
      if (!this.owner) {
        const user = await this.userStorage.getUser();
        if (user) {
          // Aquí podrías cargar el owner desde el servicio si es necesario
          console.log('Usuario cargado:', user.id);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del propietario:', error);
    }
  }

  ionViewWillEnter() {
    if (this.maps) {
      // this.maps.ionViewWillEnter()
    }
  }

  // Función del botón de pánico
  public async onPanicButtonClick(): Promise<void> {
    if (this.isPanicActive) {
      console.log('Pánico ya está activo');
      return;
    }

    if (!this.owner || !this.owner.property) {
      this.alertService.showAlert('Error', 'No se pudieron cargar los datos del propietario');
      return;
    }

    try {
      this.isPanicActive = true;
      this.isLoading = true;
      
      console.log('¡BOTÓN DE PÁNICO ACTIVADO!');
      
      // Obtener ubicación actual si está disponible
      let currentLocation = 'Ubicación no disponible';
      if (navigator.geolocation) {
        try {
          const position = await this.getCurrentPosition();
          currentLocation = `${position.coords.latitude}, ${position.coords.longitude}`;
        } catch (error) {
          console.warn('No se pudo obtener la ubicación:', error);
        }
      }

      // Usar la dirección de la propiedad o la ubicación GPS como fallback
      const propertyAddress = this.owner.property.address || currentLocation;

      // Activar antipánico con los datos correctos
      const response = await this.antipanicService.activateAntipanic(
        this.owner.id.toString(),
        propertyAddress,
        this.owner.property.id_country.toString(),
        this.owner.property.number.toString()
      ).toPromise();

      if (response && response.id) {
        this.currentPanicId = response.id;
        this.alertService.showAlert(
          '🚨 ALERTA ACTIVADA', 
          `Se ha enviado la alerta de emergencia desde:<br><strong>${this.owner.property.name}</strong><br>Dirección: ${propertyAddress}<br><br>Las autoridades han sido notificadas.`
        );
        console.log('Alerta de pánico enviada exitosamente:', response);
      }

    } catch (error) {
      console.error('Error al activar el antipánico:', error);
      this.alertService.showAlert(
        'Error', 
        'No se pudo enviar la alerta de emergencia. Intente nuevamente.'
      );
      this.isPanicActive = false;
    } finally {
      this.isLoading = false;
    }
  }

  // Función para desactivar el antipánico
  public async deactivatePanic(): Promise<void> {
    if (!this.isPanicActive || !this.currentPanicId) {
      return;
    }

    try {
      this.isLoading = true;
      await this.antipanicService.desactivateAntipanic(this.currentPanicId);
      
      this.isPanicActive = false;
      this.currentPanicId = null;
      
      this.alertService.showAlert(
        'Alerta Desactivada', 
        'La alerta de emergencia ha sido desactivada.'
      );
      
      console.log('Alerta de pánico desactivada');
    } catch (error) {
      console.error('Error al desactivar el antipánico:', error);
      this.alertService.showAlert(
        'Error', 
        'No se pudo desactivar la alerta. Contacte con seguridad.'
      );
    } finally {
      this.isLoading = false;
    }
  }

  // Función para obtener ubicación actual
  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    });
  }

  // Función para obtener el estado del botón
  public getPanicButtonClass(): string {
    if (this.isLoading) return 'panic-button loading';
    return this.isPanicActive ? 'panic-button active' : 'panic-button';
  }

  // Función para obtener el texto del botón
  public getPanicButtonText(): string {
    if (this.isLoading) return 'Enviando...';
    return this.isPanicActive ? 'ALERTA ACTIVA' : 'EMERGENCIA';
  }

  // Función para obtener información del propietario (útil para debugging)
  public getOwnerInfo(): string {
    if (!this.owner || !this.owner.property) return 'Sin datos';
    return `${this.owner.user.name} ${this.owner.user.lastname} - ${this.owner.property.name}`;
  }
}