import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

// Ionic standalone
import { IonContent, IonIcon, IonFab, IonFabButton } from '@ionic/angular/standalone';

// Mapa
import { CountryMapComponent } from '../components/maps/country-map/country-map.component';

// Servicios
import { AntipanicService, AntipanicCreateDto } from '../services/antipanic/antipanic.service';
import { OwnerStorageService } from '../services/storage/owner-interface-storage.service';
import { UserStorageService } from '../services/storage/user-storage.service';
import { AlertService } from '../services/helpers/alert.service';

// Interfaces
import { OwnerResponse } from '../interfaces/ownerResponse-interface';

// RxJS
import { firstValueFrom } from 'rxjs';

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
  @ViewChild('maps') maps?: CountryMapComponent;

  public isPanicActive = false;
  public isLoading = false;

  private owner: OwnerResponse | null = null;
  private currentPanicId: string | number | null = null;

  constructor(
    private antipanicService: AntipanicService,
    private ownerStorage: OwnerStorageService,
    private userStorage: UserStorageService,
    private alertService: AlertService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.owner = await this.ownerStorage.getOwner();
      if (!this.owner) {
        const user = await this.userStorage.getUser();
        if (user) {
          // si hace falta, acá podrías pedir el owner al backend con el id del user
          console.log('Usuario cargado:', user.id);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del propietario:', error);
    }
  }

  ionViewWillEnter() {
    if (this.maps) {
      // this.maps.ionViewWillEnter();
    }
  }

  // BOTÓN DE PÁNICO
  public async onPanicButtonClick(): Promise<void> {
    if (this.isPanicActive) {
      console.log('Pánico ya está activo');
      return;
    }

    if (!this.owner || !this.owner.property) {
      this.alertService.showAlert('Error', 'No se pudieron cargar los datos del propietario');
      return;
    }

    this.isPanicActive = true;
    this.isLoading = true;

    try {
      console.log('¡BOTÓN DE PÁNICO ACTIVADO!');

      // 1) Obtener coordenadas (o fallback)
      let latitude = -27.5615;
      let longitude = -58.7521;

      if (navigator.geolocation) {
        try {
          const pos = await this.getCurrentPosition();
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        } catch (e) {
          console.warn('No se pudo obtener la ubicación, uso fallback:', e);
        }
      }

      // 2) Armar payload JSON esperado por backend
      const dto: AntipanicCreateDto = {
        id_owner: this.owner.id,
        address: this.owner.property.address || `${latitude}, ${longitude}`,
        id_country: this.owner.property.id_country,
        propertyNumber: this.owner.property.number,
        latitude,
        longitude
      };

      // 3) Llamar service (JSON)
      const resp = await firstValueFrom(this.antipanicService.activateAntipanic(dto));

      if (resp && resp.id) {
        this.currentPanicId = resp.id;
        this.alertService.showAlert(
          '🚨 ALERTA ACTIVADA',
          `Se envió la alerta desde:<br><strong>${this.owner.property.name}</strong><br>
           Dirección: ${dto.address}<br><small>(${latitude.toFixed(5)}, ${longitude.toFixed(5)})</small>`
        );
        console.log('Alerta de pánico enviada:', resp);
      } else {
        console.warn('Respuesta sin id:', resp);
      }
    } catch (error) {
      console.error('Error al activar el antipánico:', error);
      this.alertService.showAlert('Error', 'No se pudo enviar la alerta de emergencia. Intente nuevamente.');
      this.isPanicActive = false;
    } finally {
      this.isLoading = false;
    }
  }

  // DESACTIVAR
  public async deactivatePanic(): Promise<void> {
    if (!this.isPanicActive || !this.currentPanicId) return;

    this.isLoading = true;
    try {
      await firstValueFrom(this.antipanicService.desactivateAntipanic(this.currentPanicId));
      this.isPanicActive = false;
      this.currentPanicId = null;
      this.alertService.showAlert('Alerta Desactivada', 'La alerta de emergencia ha sido desactivada.');
      console.log('Alerta de pánico desactivada');
    } catch (error) {
      console.error('Error al desactivar el antipánico:', error);
      this.alertService.showAlert('Error', 'No se pudo desactivar la alerta. Contacte con seguridad.');
    } finally {
      this.isLoading = false;
    }
  }

  // Utils
  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    });
  }

  public getPanicButtonClass(): string {
    if (this.isLoading) return 'panic-button loading';
    return this.isPanicActive ? 'panic-button active' : 'panic-button';
    }

  public getPanicButtonText(): string {
    if (this.isLoading) return 'Enviando...';
    return this.isPanicActive ? 'ALERTA ACTIVA' : 'EMERGENCIA';
  }

  public getOwnerInfo(): string {
    if (!this.owner || !this.owner.property) return 'Sin datos';
    return `${this.owner.user.name} ${this.owner.user.lastname} - ${this.owner.property.name}`;
  }
}
