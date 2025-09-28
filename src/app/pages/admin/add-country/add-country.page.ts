import { AfterViewInit, Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as L from 'leaflet';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { Router } from '@angular/router';
import { CountriesService } from 'src/app/services/countries/countries.service';
import { ThemeService } from 'src/app/services/theme/theme.service';

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
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  @ViewChild('formSection', { read: ElementRef, static: false }) formSection!: ElementRef;

  private map: L.Map | null = null;
  public lat: number = -27.4512; // Coordenadas iniciales (Resistencia, Chaco)
  public lng: number = -58.9867; // Coordenadas iniciales (Resistencia, Chaco)
  public marker: L.Marker | null = null;
  public newImg: string | ArrayBuffer | null = null;

  // ISTEMA DINÁMICO DE PERÍMETRO
  public currentStep: number = 1;
  public centerCoords: { lat: number, lng: number } | null = null;
  public perimeterPoints: L.LatLng[] = [];
  public perimeterMarkers: L.Marker[] = [];
  public polygon: L.Polygon | null = null;
  public isPerimeterComplete: boolean = false;
  public minPerimeterPoints: number = 3; // Mínimo 3 puntos
  public isProcessing: boolean = false; // Estado de carga

  public form: FormGroup;

  constructor(
    private _countries: CountriesService,
    private _formBuilder: FormBuilder,
    private _alertService: AlertService,
    private _router: Router,
    public theme: ThemeService
  ) {
    this.form = this.createForm();
  }

  private createForm(): FormGroup {
    return this._formBuilder.group({
      countryName: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required]],
      locality: [''],
      phone: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]],
      countryAvatar: new FormControl(null, []),
      fileSource: new FormControl(null, [Validators.required])
    });
  }

  ngAfterViewInit(): void {
    // Heredar tema del servicio global
    this.theme?.init('admin');
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [this.lat, this.lng],
      zoom: 12
    });

    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    });
    tiles.addTo(this.map);

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize(true);
      }
    }, 100);

    this.map.attributionControl.setPrefix(false);

    const centerIcon = L.icon({
      iconUrl: 'assets/marker.png',
      shadowUrl: 'assets/logos/marker-shadow.png',
      iconSize: [35, 35],
      shadowSize: [50, 64],
      iconAnchor: [17, 35],
      shadowAnchor: [4, 62],
      popupAnchor: [0, -35]
    });

    this.marker = L.marker([this.lat, this.lng], {
      draggable: true,
      icon: centerIcon
    }).addTo(this.map);

    this.marker.on('drag', (event) => {
      const position = (event.target as L.Marker).getLatLng();
      this.lat = position.lat;
      this.lng = position.lng;
    });

    this.map.on('click', (event) => {
      if (this.currentStep === 1) {
        const { lat, lng } = event.latlng;
        this.lat = lat;
        this.lng = lng;
        if (this.marker) {
          this.marker.setLatLng([lat, lng]);
        }
      } else if (this.currentStep === 2) {
        this.addPerimeterPoint(event.latlng);
      }
    });
  }

  //CONFIRMAR CENTRO Y PASAR AL PASO 2
  public confirmCenter(): void {
    this.setCoords();
    this.centerCoords = { lat: this.lat, lng: this.lng };
    this.currentStep = 2;

    if (this.marker) {
      this.marker.dragging?.disable();
    }

    this._alertService.presentAlert('Centro confirmado. Ahora haz clic en el mapa para marcar los puntos del perímetro del barrio.');
  }

  // AGREGAR PUNTOS DEL PERÍMETRO DINÁMICAMENTE
  private addPerimeterPoint(latlng: L.LatLng): void {
    this.perimeterPoints.push(latlng);

    const perimeterIcon = L.icon({
      iconUrl: 'assets/marker.png',
      iconSize: [25, 25],
      iconAnchor: [12, 25],
      popupAnchor: [0, -25]
    });

    const perimeterMarker = L.marker(latlng, {
      icon: perimeterIcon
    }).addTo(this.map!);

    perimeterMarker.bindTooltip(`${this.perimeterPoints.length}`, {
      permanent: true,
      direction: 'top',
      className: 'custom-tooltip'
    });

    this.perimeterMarkers.push(perimeterMarker);

    if (this.perimeterPoints.length >= this.minPerimeterPoints) {
      this.updatePolygon();
    }

    console.log(`Punto ${this.perimeterPoints.length} agregado`);
  }

  //ACTUALIZAR POLÍGONO EN TIEMPO REAL
  private updatePolygon(): void {
    if (this.polygon && this.map) {
      this.map.removeLayer(this.polygon);
    }

    if (this.perimeterPoints.length >= this.minPerimeterPoints && this.map) {
      this.polygon = L.polygon(this.perimeterPoints, {
        color: this.isPerimeterComplete ? '#10b981' : '#f59e0b',
        fillColor: this.isPerimeterComplete ? '#10b981' : '#f59e0b',
        fillOpacity: 0.2,
        weight: 3
      }).addTo(this.map);
    }
  }

  //CONFIRMAR PERÍMETRO Y SCROLL AL FORMULARIO
  public confirmPerimeter(): void {
    if (this.perimeterPoints.length < this.minPerimeterPoints) {
      this._alertService.presentAlert(`Necesitas al menos ${this.minPerimeterPoints} puntos para formar un perímetro válido.`);
      return;
    }

    this.isPerimeterComplete = true;
    this.updatePolygon();

    //SCROLL AUTOMÁTICO AL FORMULARIO
    setTimeout(() => {
      if (this.formSection && this.content) {
        const element = this.formSection.nativeElement;
        const yOffset = element.offsetTop - 20; // 20px de margen
        this.content.scrollToPoint(0, yOffset, 800); // 800ms de animación
      }
    }, 300);

    this._alertService.presentAlert(`Perímetro completado con ${this.perimeterPoints.length} puntos. Formulario disponible abajo.`);
  }

  // DESHACER ÚLTIMO PUNTO
  public removeLastPoint(): void {
    if (this.perimeterPoints.length === 0) return;

    this.perimeterPoints.pop();
    const lastMarker = this.perimeterMarkers.pop();
    
    if (lastMarker && this.map) {
      this.map.removeLayer(lastMarker);
    }

    if (this.perimeterPoints.length >= this.minPerimeterPoints) {
      this.updatePolygon();
    } else if (this.polygon && this.map) {
      this.map.removeLayer(this.polygon);
      this.polygon = null;
    }

    this.isPerimeterComplete = false;
  }

  // REINICIAR PERÍMETRO
  public resetPerimeter(): void {
    this.perimeterMarkers.forEach(marker => {
      if (this.map) {
        this.map.removeLayer(marker);
      }
    });

    if (this.polygon && this.map) {
      this.map.removeLayer(this.polygon);
      this.polygon = null;
    }

    this.perimeterPoints = [];
    this.perimeterMarkers = [];
    this.isPerimeterComplete = false;
  }

  //VOLVER AL PASO 1
  public backToStep1(): void {
    this.currentStep = 1;
    this.centerCoords = null;
    this.resetPerimeter();

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
      // Validar tamaño del archivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this._alertService.presentAlert('El archivo es muy grande. Máximo 5MB permitido.');
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this._alertService.presentAlert('Solo se permiten archivos de imagen.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => this.newImg = reader.result as string;
      reader.readAsDataURL(file);

      this.form.patchValue({
        fileSource: file
      });
    }
  }

  //MÉTODO PARA ACTIVAR EL FILE INPUT
  public triggerFileInput(): void {
    const fileInput = document.getElementById('avatar-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  //CONEXIÓN COMPLETA CON EL BACKEND
  public async addCountry(): Promise<void> {
    if (this.isProcessing) return;

    console.log('Estado del formulario:', this.form.status);
    console.log('Valores del formulario:', this.form.value);

    if (this.form.invalid) {
      this._alertService.presentAlert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    if (this.perimeterPoints.length < this.minPerimeterPoints) {
      this._alertService.presentAlert(`Debe marcar al menos ${this.minPerimeterPoints} puntos del perímetro.`);
      return;
    }

    if (!this.isPerimeterComplete) {
      this._alertService.presentAlert('Debe confirmar el perímetro antes de guardar.');
      return;
    }

    this.isProcessing = true;
    this.setCoords();

    try {
      const { countryName, address, locality, phone, fileSource } = this.form.value;

      //PREPARAR DATOS PARA EL BACKEND
      const perimeterData = this.perimeterPoints.map(point => ({
        lat: point.lat,
        lng: point.lng
      }));

      console.log('Enviando datos al backend:', {
        countryName,
        centerLat: this.lat,
        centerLng: this.lng,
        address,
        locality,
        phone,
        perimeterPoints: perimeterData.length,
        avatar: fileSource?.name
      });

      //LLAMADA AL SERVICIO DEL BACKEND
      await this._countries.addCountry(
        fileSource as File,
        countryName,
        String(this.lat), // Center Lat
        String(this.lng), // Center Lng
        address,
        locality || '',
        phone || '',
        JSON.stringify(perimeterData) // Perímetro como JSON string
      );

      //ÉXITO - LIMPIAR Y REDIRIGIR
      this._alertService.presentAlert('Country creado exitosamente.');
      this.form.reset();
      this.resetPerimeter();
      this.currentStep = 1;
      this.newImg = null;
      
      setTimeout(() => {
        this._router.navigate(['/admin/home']);
      }, 1500);

    } catch (error) {
      console.error('Error al crear el country:', error);
      this._alertService.presentAlert('Error al crear el country. Intente nuevamente.');
    } finally {
      this.isProcessing = false;
    }
  }
}