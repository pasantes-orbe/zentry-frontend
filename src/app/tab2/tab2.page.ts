import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componentes Standalone de Ionic
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';

// CORRECCIÓN: Se importa el componente correcto que usa el HTML (MapsComponent)
import { CountryMapComponent } from '../components/maps/country-map/country-map.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    // Componentes de Ionic
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    // Tu componente
    CountryMapComponent
  ]
})
export class Tab2Page implements OnInit {

  @ViewChild('maps') maps: CountryMapComponent;

  constructor() {}

  ngOnInit(): void {}

  ionViewWillEnter() {
    if (this.maps) {
      // this.maps.ionViewWillEnter() // Se comenta temporalmente hasta migrar MapsComponent
    }
  }
}
