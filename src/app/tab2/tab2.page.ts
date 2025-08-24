import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componentes Standalone de Ionic
import { IonContent, IonIcon, IonFab, IonFabButton } from '@ionic/angular/standalone';

// Tu componente de mapa
import { CountryMapComponent } from '../components/maps/country-map/country-map.component';

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
    IonFabButton
    // CountryMapComponent - comentado hasta que lo uses en el template
  ]
})
export class Tab2Page implements OnInit {
  @ViewChild('maps') maps: CountryMapComponent;
  
  public isPanicActive: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  ionViewWillEnter() {
    if (this.maps) {
      // this.maps.ionViewWillEnter()
    }
  }

  // Función del botón de pánico
  public onPanicButtonClick() {
    if (this.isPanicActive) {
      console.log('Pánico ya está activo');
      return;
    }

    this.isPanicActive = true;
    console.log('¡BOTÓN DE PÁNICO ACTIVADO!');
    
    // Aquí iría tu lógica de emergencia:
    // - Enviar ubicación actual
    // - Notificar a contactos de emergencia
    // - Enviar alerta al sistema
    
    // Simular proceso de emergencia
    setTimeout(() => {
      this.isPanicActive = false;
      console.log('Alerta de pánico enviada');
    }, 3000);
  }

  // Función para obtener el estado del botón
  public getPanicButtonClass(): string {
    return this.isPanicActive ? 'panic-button active' : 'panic-button';
  }
}