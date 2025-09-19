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
      zoom: 12 // Ajustar el nivel de zoom para un enfoque más cercano
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

    // Configurar icono personalizado para el marcador
    const customIcon = L.icon({
      iconUrl: 'assets/marker.png', // Ruta del icono personalizado
      shadowUrl: 'assets/logos/marker-shadow.png', // Ruta de la sombra del marcador
      iconSize: [35, 35], // Tamaño del icono
      shadowSize: [50, 64], // Tamaño de la sombra
      iconAnchor: [17, 35], // Punto de anclaje del icono
      shadowAnchor: [4, 62], // Punto de anclaje de la sombra
      popupAnchor: [0, -35] // Punto de anclaje del popup
    });

    // Crear marcador arrastrable con el icono personalizado
    this.marker = L.marker([this.lat, this.lng], {
      draggable: true,
      icon: customIcon
    }).addTo(this.map);

    // Actualizar coordenadas al mover el marcador
    this.marker.on('drag', (event) => {
      const position = (event.target as L.Marker).getLatLng();
      this.lat = position.lat;
      this.lng = position.lng;
    });

    // Actualizar coordenadas al hacer clic en el mapa
    this.map.on('click', (event) => {
      const { lat, lng } = event.latlng;
      this.lat = lat;
      this.lng = lng;

      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      }
    });
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

      // Actualizar el valor del campo fileSource
      this.form.patchValue({
        fileSource: file
      });

      // Depuración: Verificar que el archivo se haya cargado correctamente
      console.log('Archivo cargado:', file);
    }
  }

  public addCountry(): void {
    // Depuración: Verificar el estado del formulario
    console.log('Estado del formulario:', this.form.status);
    console.log('Errores del formulario:', this.form.errors);
    console.log('Valores del formulario:', this.form.value);

    if (this.form.invalid) {
      this._alertService.presentAlert('Formulario Inválido: Por favor, complete todos los campos.');
      return;
    }

    this.setCoords();

    const { countryName, address, locality, phone, fileSource } = this.form.value;

    console.log('Datos del formulario listos para enviar:', {
      countryName,
      address,
      locality,
      phone,
      lat: this.lat,
      lng: this.lng,
      avatar: fileSource
    });

    this._alertService.presentAlert('Éxito , el formulario es válido y los datos están listos para enviarse.');
  }
}