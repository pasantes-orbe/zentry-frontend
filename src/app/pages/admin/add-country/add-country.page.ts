import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as L from 'leaflet';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { Router } from '@angular/router';
import { CountriesService } from 'src/app/services/countries/countries.service';

// Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";

// Fix para iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/marker.png',
  shadowUrl: 'assets/logos/marker-shadow.png',
});

@Component({
  selector: 'app-add-country',
  templateUrl: './add-country.page.html',
  styleUrls: ['./add-country.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    NavbarBackComponent
  ]
})
export class AddCountryPage implements AfterViewInit, OnDestroy {
  private map: L.Map | null = null;
  public lat: number = -27.4512; // Coordenadas iniciales (Resistencia, Chaco)
  public lng: number = -58.9867; // Coordenadas iniciales (Resistencia, Chaco)
  public marker: L.Marker | null = null;
  public newImg: string | ArrayBuffer | null = null;

  // ✅ NUEVAS PROPIEDADES PARA EL SISTEMA DE DOS PASOS
  public currentStep: number = 1; // Paso actual (1 = centro, 2 = perímetro)
  public centerCoords: { lat: number, lng: number } | null = null;
  public perimeterPoints: L.LatLng[] = []; // Array de puntos del perímetro
  public perimeterMarkers: L.Marker[] = []; // Marcadores del perímetro
  public polygon: L.Polygon | null = null; // Polígono del perímetro

  public form: FormGroup;

  constructor(
    private _countries: CountriesService,
    private _formBuilder: FormBuilder,
    private _alertService: AlertService,
    private _router: Router
  ) {
    this.form = this.createForm();
  }

  private createForm(): FormGroup {
    return this._formBuilder.group({
      countryName: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required]],
      locality: [''],
      phone: [''],
      countryAvatar: new FormControl(null, []),
      fileSource: new FormControl(null, [Validators.required])
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Crear mapa centrado en Resistencia, Chaco
    this.map = L.map('map', {
      center: [this.lat, this.lng],
      zoom: 12
    });

    // Agregar tiles
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    });
    tiles.addTo(this.map);

    // Fix para el tamaño del mapa
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize(true);
      }
    }, 100);

    this.map.attributionControl.setPrefix(false);

    // Configurar icono personalizado para el marcador del centro
    const centerIcon = L.icon({
      iconUrl: 'assets/marker.png',
      shadowUrl: 'assets/logos/marker-shadow.png',
      iconSize: [35, 35],
      shadowSize: [50, 64],
      iconAnchor: [17, 35],
      shadowAnchor: [4, 62],
      popupAnchor: [0, -35]
    });

    // Crear marcador arrastrable para el centro
    this.marker = L.marker([this.lat, this.lng], {
      draggable: true,
      icon: centerIcon
    }).addTo(this.map);

    // Actualizar coordenadas al mover el marcador del centro
    this.marker.on('drag', (event) => {
      const position = (event.target as L.Marker).getLatLng();
      this.lat = position.lat;
      this.lng = position.lng;
    });

    // ✅ LISTENER PARA CLICKS EN EL MAPA (SEGÚN EL PASO ACTUAL)
    this.map.on('click', (event) => {
      if (this.currentStep === 1) {
        // PASO 1: Mover el marcador del centro
        const { lat, lng } = event.latlng;
        this.lat = lat;
        this.lng = lng;

        if (this.marker) {
          this.marker.setLatLng([lat, lng]);
        }
      } else if (this.currentStep === 2) {
        // PASO 2: Agregar puntos del perímetro
        this.addPerimeterPoint(event.latlng);
      }
    });
  }

  // ✅ MÉTODO PARA CONFIRMAR EL CENTRO Y PASAR AL PASO 2
  public confirmCenter(): void {
    this.setCoords();
    this.centerCoords = { lat: this.lat, lng: this.lng };
    this.currentStep = 2;

    // Hacer el marcador del centro no arrastrable
    if (this.marker) {
      this.marker.dragging?.disable();
    }

    this._alertService.presentAlert('Centro confirmado , Ahora haz clic en 4 puntos para marcar el perímetro del barrio.');
  }

  // ✅ MÉTODO PARA AGREGAR PUNTOS DEL PERÍMETRO
  private addPerimeterPoint(latlng: L.LatLng): void {
    if (this.perimeterPoints.length >= 4) {
      this._alertService.presentAlert('Máximo alcanzado , Ya has marcado 4 puntos del perímetro.');
      return;
    }

    // Agregar el punto al array
    this.perimeterPoints.push(latlng);

    // Crear marcador para el punto del perímetro
    const perimeterIcon = L.icon({
      iconUrl: 'assets/marker.png', // Puedes usar un icono diferente
      iconSize: [25, 25],
      iconAnchor: [12, 25],
      popupAnchor: [0, -25]
    });

    const perimeterMarker = L.marker(latlng, {
      icon: perimeterIcon
    }).addTo(this.map!);

    this.perimeterMarkers.push(perimeterMarker);

    // Si ya tenemos 4 puntos, crear el polígono
    if (this.perimeterPoints.length === 4) {
      this.createPolygon();
    }

    console.log(`Punto ${this.perimeterPoints.length} del perímetro agregado:`, latlng);
  }

  // ✅ MÉTODO PARA CREAR EL POLÍGONO
  private createPolygon(): void {
    if (this.perimeterPoints.length === 4 && this.map) {
      // Crear polígono con los 4 puntos
      this.polygon = L.polygon(this.perimeterPoints, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.3
      }).addTo(this.map);

      this._alertService.presentAlert('Perímetro completado el perímetro del barrio ha sido marcado. Ahora puedes completar el formulario.');
    }
  }

  // ✅ MÉTODO PARA REINICIAR EL PERÍMETRO
  public resetPerimeter(): void {
    // Eliminar marcadores del perímetro
    this.perimeterMarkers.forEach(marker => {
      if (this.map) {
        this.map.removeLayer(marker);
      }
    });

    // Eliminar polígono
    if (this.polygon && this.map) {
      this.map.removeLayer(this.polygon);
      this.polygon = null;
    }

    // Limpiar arrays
    this.perimeterPoints = [];
    this.perimeterMarkers = [];

    console.log('Perímetro reiniciado');
  }

  // ✅ MÉTODO PARA VOLVER AL PASO 1
  public backToStep1(): void {
    this.currentStep = 1;
    this.centerCoords = null;
    this.resetPerimeter();

    // Hacer el marcador del centro arrastrable nuevamente
    if (this.marker) {
      this.marker.dragging?.enable();
    }
  }

  setCoords(): void {
    if (this.marker) {
      const { lat, lng } = this.marker.getLatLng();
      this.lat = lat;
      this.lng = lng;
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.newImg = reader.result as string;
      reader.readAsDataURL(file);

      this.form.patchValue({
        fileSource: file
      });

      console.log('Archivo cargado:', file);
    }
  }

  public addCountry(): void {
    console.log('Estado del formulario:', this.form.status);
    console.log('Valores del formulario:', this.form.value);

    if (this.form.invalid) {
      this._alertService.presentAlert('Formulario Inválido: Por favor, complete todos los campos.');
      return;
    }

    if (this.perimeterPoints.length !== 4) {
      this._alertService.presentAlert('Perímetro incompleto , debe marcar exactamente 4 puntos del perímetro.');
      return;
    }

    this.setCoords();

    const { countryName, address, locality, phone, fileSource } = this.form.value;

    // ✅ DATOS COMPLETOS INCLUYENDO CENTRO Y PERÍMETRO
    const countryData = {
      countryName,
      address,
      locality,
      phone,
      centerLat: this.lat,
      centerLng: this.lng,
      perimeterPoints: this.perimeterPoints.map(point => ({
        lat: point.lat,
        lng: point.lng
      })),
      avatar: fileSource
    };

    console.log('Datos completos para enviar:', countryData);

    // Aquí llamarías al servicio actualizado
    // this._countries.addCountry(...);
    
    this._alertService.presentAlert('Éxito , country con perímetro listo para enviar al backend.');
  }
}