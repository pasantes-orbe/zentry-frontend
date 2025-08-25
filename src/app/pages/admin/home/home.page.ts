import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AlertController, PopoverController } from '@ionic/angular';

// Servicios
import { CountriesService } from 'src/app/services/countries/countries.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

// Interfaces
import { CountryInteface } from '../../../interfaces/country-interface';

// Componentes
import { NavbarAdminComponent } from 'src/app/components/navbars/navbar-admin/navbar-admin.component';
import { CountryPopoverComponent } from 'src/app/components/country-popover/country-popover.component';

// Interfaces para mock data
interface MockProperty {
  id: number;
  name: string;
  address: string;
  type: string;
}

interface MockOwner {
  id: number;
  name: string;
  lastname: string;
  dni: string;
  email: string;
  phone: string;
  avatar: string;
  property?: MockProperty;
}

interface MockAmenity {
  id: number;
  name: string;
  address: string;
  avatar: string;
  isActive: boolean;
}

interface MockGuard {
  id: number;
  name: string;
  lastname: string;
  dni: string;
  email: string;
  phone: string;
  avatar: string;
  working: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    // Componentes
    NavbarAdminComponent,
    CountryPopoverComponent
  ]
})
export class HomePage implements OnInit {
  protected countries: CountryInteface[] = [];

  // MOCK DATA PARA DEMO
  public mockCountry: CountryInteface = {
    id: 1,
    name: 'Argentina Country Club',
    avatar: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    latitude: -27.5615,
    longitude: -58.7521,
    isActive: true
  };

  public mockProperties: MockProperty[] = [
    { id: 1, name: 'Casa Jardín Norte', address: 'Av. Principal 123', type: 'Casa' },
    { id: 2, name: 'Depto Torre Azul', address: 'Calle Secundaria 456', type: 'Departamento' },
    { id: 3, name: 'Villa Las Rosas', address: 'Pasaje Flores 789', type: 'Villa' },
    { id: 4, name: 'Casa Moderna Plus', address: 'Boulevard Central 101', type: 'Casa' },
    { id: 5, name: 'Loft Urbano Style', address: 'Av. Libertad 202', type: 'Loft' },
    { id: 6, name: 'Chalet Los Pinos', address: 'Calle Verde 303', type: 'Chalet' },
    { id: 7, name: 'Casa Familiar Grande', address: 'Paseo Familia 404', type: 'Casa' },
    { id: 8, name: 'Estudio Compacto', address: 'Calle Corta 505', type: 'Estudio' },
    { id: 9, name: 'Duplex Vista Mar', address: 'Costera Norte 606', type: 'Duplex' },
    { id: 10, name: 'Casa Colonial', address: 'Calle Historia 707', type: 'Casa' },
    { id: 11, name: 'Penthouse Elite', address: 'Torre Premium 808', type: 'Penthouse' },
    { id: 12, name: 'Casa Esquina Sol', address: 'Av. Sol y Luna 909', type: 'Casa' },
    { id: 13, name: 'Apartamento Centro', address: 'Plaza Central 110', type: 'Apartamento' },
    { id: 14, name: 'Villa Residencial', address: 'Barrio Privado 220', type: 'Villa' },
    { id: 15, name: 'Casa Quinta Bella', address: 'Camino Quinta 330', type: 'Quinta' }
  ];

  public mockOwners: MockOwner[] = [
    { id: 1, name: 'Juan', lastname: 'Pérez', dni: '12345678', email: 'juan.perez@email.com', phone: '3794123456', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    { id: 2, name: 'María', lastname: 'González', dni: '23456789', email: 'maria.gonzalez@email.com', phone: '3794234567', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b169313f?w=150' },
    { id: 3, name: 'Carlos', lastname: 'Rodríguez', dni: '34567890', email: 'carlos.rodriguez@email.com', phone: '3794345678', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 4, name: 'Ana', lastname: 'Martínez', dni: '45678901', email: 'ana.martinez@email.com', phone: '3794456789', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
    { id: 5, name: 'Luis', lastname: 'Fernández', dni: '56789012', email: 'luis.fernandez@email.com', phone: '3794567890', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { id: 6, name: 'Laura', lastname: 'Sánchez', dni: '67890123', email: 'laura.sanchez@email.com', phone: '3794678901', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { id: 7, name: 'Pedro', lastname: 'Ramírez', dni: '78901234', email: 'pedro.ramirez@email.com', phone: '3794789012', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
    { id: 8, name: 'Carmen', lastname: 'Torres', dni: '89012345', email: 'carmen.torres@email.com', phone: '3794890123', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150' },
    { id: 9, name: 'Miguel', lastname: 'Vargas', dni: '90123456', email: 'miguel.vargas@email.com', phone: '3794901234', avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150' },
    { id: 10, name: 'Isabel', lastname: 'Herrera', dni: '01234567', email: 'isabel.herrera@email.com', phone: '3794012345', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { id: 11, name: 'Roberto', lastname: 'Jiménez', dni: '11223344', email: 'roberto.jimenez@email.com', phone: '3794112233', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
    { id: 12, name: 'Patricia', lastname: 'Morales', dni: '22334455', email: 'patricia.morales@email.com', phone: '3794223344', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150' },
    { id: 13, name: 'Francisco', lastname: 'Ruiz', dni: '33445566', email: 'francisco.ruiz@email.com', phone: '3794334455', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    { id: 14, name: 'Elena', lastname: 'Castro', dni: '44556677', email: 'elena.castro@email.com', phone: '3794445566', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b169313f?w=150' },
    { id: 15, name: 'Andrés', lastname: 'Ortega', dni: '55667788', email: 'andres.ortega@email.com', phone: '3794556677', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 16, name: 'Gabriela', lastname: 'Vega', dni: '66778899', email: 'gabriela.vega@email.com', phone: '3794667788', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
    { id: 17, name: 'Sergio', lastname: 'Mendoza', dni: '77889900', email: 'sergio.mendoza@email.com', phone: '3794778899', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { id: 18, name: 'Valeria', lastname: 'Silva', dni: '88990011', email: 'valeria.silva@email.com', phone: '3794889900', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { id: 19, name: 'Raúl', lastname: 'Paredes', dni: '99001122', email: 'raul.paredes@email.com', phone: '3794990011', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
    { id: 20, name: 'Mónica', lastname: 'Delgado', dni: '00112233', email: 'monica.delgado@email.com', phone: '3794001122', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150' }
  ];

  public mockAmenities: MockAmenity[] = [
    { id: 1, name: 'SUM (Salón de Usos Múltiples)', address: 'Sector Central, Planta Baja', avatar: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400', isActive: true },
    { id: 2, name: 'Cancha de Fútbol', address: 'Campo Deportivo Norte', avatar: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400', isActive: true },
    { id: 3, name: 'Cancha de Básquet', address: 'Polideportivo Central', avatar: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400', isActive: true },
    { id: 4, name: 'Campo de Golf', address: 'Sector Recreativo Este', avatar: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400', isActive: true },
    { id: 5, name: 'Quincho con Piscina', address: 'Área Recreativa Sur', avatar: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', isActive: true },
    { id: 6, name: 'Centro Comunitario', address: 'Plaza Principal', avatar: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', isActive: true }
  ];

  public mockGuards: MockGuard[] = [
    { id: 1, name: 'Diego', lastname: 'Moreno', dni: '20123456', email: 'diego.moreno@security.com', phone: '3794111111', avatar: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=150', working: true },
    { id: 2, name: 'Fernando', lastname: 'López', dni: '21234567', email: 'fernando.lopez@security.com', phone: '3794222222', avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150', working: true },
    { id: 3, name: 'Ricardo', lastname: 'Acosta', dni: '22345678', email: 'ricardo.acosta@security.com', phone: '3794333333', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', working: false },
    { id: 4, name: 'Marcos', lastname: 'Villalba', dni: '23456789', email: 'marcos.villalba@security.com', phone: '3794444444', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', working: true }
  ];

  constructor(
    private countriesService: CountriesService,
    private countryStorage: CountryStorageService,
    private alertCtrl: AlertController,
    private popoverController: PopoverController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMockData();
  }

  ionViewWillEnter() {
    this.loadMockData();
  }

  // Método para cargar datos mock en lugar de la base de datos
  private loadMockData() {
    // Asignar propiedades a propietarios aleatoriamente
    this.assignPropertiesToOwners();
    
    // Simular carga de países con el mock country
    this.countries = [this.mockCountry];
    
    console.log('Mock data loaded:', {
      countries: this.countries,
      properties: this.mockProperties,
      owners: this.mockOwners,
      amenities: this.mockAmenities,
      guards: this.mockGuards
    });
  }

  // Asignar propiedades a propietarios
  private assignPropertiesToOwners() {
    // Asignar las primeras 15 propiedades a los primeros 15 propietarios
    for (let i = 0; i < 15 && i < this.mockOwners.length; i++) {
      this.mockOwners[i].property = this.mockProperties[i];
    }
  }

  // Métodos públicos para acceder a los datos mock
  public getMockProperties() {
    return this.mockProperties;
  }

  public getMockOwners() {
    return this.mockOwners.filter(owner => owner.property); // Solo propietarios con propiedad asignada
  }

  public getMockAmenities() {
    return this.mockAmenities.filter(amenity => amenity.isActive);
  }

  public getMockGuards() {
    return this.mockGuards;
  }

  public getMockWorkingGuards() {
    return this.mockGuards.filter(guard => guard.working);
  }

  public getMockOffDutyGuards() {
    return this.mockGuards.filter(guard => !guard.working);
  }

  // ====================================================
  // MÉTODOS DE NAVEGACIÓN
  // ====================================================
  
  navigateToCountries() {
    this.router.navigate(['/admin/country-dashboard']);
  }

  navigateToOwners() {
    this.router.navigate(['/admin/view-owners']);
  }

  navigateToGuards() {
    this.router.navigate(['/admin/all-guards']);
  }

  navigateToReports() {
    this.router.navigate(['/admin/events-historial']);
  }

  navigateToAddCountry() {
    this.router.navigate(['/admin/add-country']);
  }

  navigateToAddOwner() {
    this.router.navigate(['/admin/add-country-owner']);
  }

  navigateToAssignCountryToOwner() {
    this.router.navigate(['/admin/assign-country-to-owner']);
  }

  navigateToAddAmenity() {
    this.router.navigate(['/admin/add-amenity']);
  }

  navigateToViewAllAmenities() {
    this.router.navigate(['/admin/view-all-amenities']);
  }

  navigateToMapGuards() {
    this.router.navigate(['/map-guards']);
  }

  navigateToAddProperty() {
    this.router.navigate(['/admin/add-property']);
  }

  // ====================================================
  // MÉTODOS EXISTENTES (mantenidos para compatibilidad)
  // ====================================================

  private getCountriesFromDB() {
    // Usar datos mock en lugar de base de datos para la demo
    this.loadMockData();
  }

  saveCountryLocalStorage(country: CountryInteface) {
    this.countryStorage.saveCountry(country);
  }

  async openPopover(country: CountryInteface, ev: any) {
    const popover = await this.popoverController.create({
      component: CountryPopoverComponent,
      event: ev,
      translucent: true,
      componentProps: {
        country: country
      }
    });

    popover.onDidDismiss().then((data) => {
      if (data?.data?.deleted) {
        this.loadMockData();
      }
    });

    return await popover.present();
  }

  private async handleError(error: any) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: 'No se pudieron cargar los datos. Usando datos de demostración.',
      buttons: ['OK']
    });

    await alert.present();
    console.error('Error al cargar datos:', error);
    // Cargar datos mock como fallback
    this.loadMockData();
  }

  getCountryImage(country: CountryInteface): string {
    return country.avatar || country.image || 'https://ionicframework.com/docs/img/demos/card-media.png';
  }

  // Método para mostrar estadísticas de la demo
  public showDemoStats() {
    const stats = {
      countries: this.countries.length,
      properties: this.mockProperties.length,
      owners: this.getMockOwners().length,
      amenities: this.getMockAmenities().length,
      guards: this.mockGuards.length,
      workingGuards: this.getMockWorkingGuards().length
    };

    console.log('Demo Statistics:', stats);
    return stats;
  }
}


/*import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AlertController, PopoverController } from '@ionic/angular';

// Servicios
import { CountriesService } from 'src/app/services/countries/countries.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

// Interfaces
import { CountryInteface } from '../../../interfaces/country-interface';

// Componentes
import { NavbarAdminComponent } from 'src/app/components/navbars/navbar-admin/navbar-admin.component';
import { CountryPopoverComponent } from 'src/app/components/country-popover/country-popover.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    // Componentes
    NavbarAdminComponent,
    CountryPopoverComponent
  ]
})
export class HomePage implements OnInit {
  protected countries: CountryInteface[] = [];

  constructor(
    private countriesService: CountriesService,
    private countryStorage: CountryStorageService,
    private alertCtrl: AlertController,
    private popoverController: PopoverController,
    private router: Router
  ) {}

  ngOnInit() {
    this.getCountriesFromDB();
  }

  ionViewWillEnter() {
    this.getCountriesFromDB();
  }

  // ====================================================
  // MÉTODOS DE NAVEGACIÓN
  // ====================================================
  
  // MÉTODOS DE NAVEGACIÓN CORRECTOS:

navigateToCountries() {
  // Ya estás en admin/home que lista countries
  // Puedes ir al dashboard del country o crear uno nuevo
  this.router.navigate(['/admin/country-dashboard']);
}

navigateToOwners() {
  // Ir a la vista de propietarios
  this.router.navigate(['/admin/view-owners']);
}

navigateToGuards() {
  // Ir a la vista de todos los guardias
  this.router.navigate(['/admin/all-guards']);
}

navigateToReports() {
  // Ir al historial de eventos (reportes)
  this.router.navigate(['/admin/events-historial']);
}

navigateToAddCountry() {
  // Ir a la vista para agregar un nuevo país
  this.router.navigate(['/admin/add-country']);
}

navigateToAddOwner() {
  // Ir a la vista para agregar un nuevo propietario
  this.router.navigate(['/admin/add-country-owner']);
}

navigateToAssignCountryToOwner() {
  // Ir a la vista para asignar un país a un propietario
  this.router.navigate(['/admin/assign-country-to-owner']);
}

navigateToAddAmenity() {
  // Ir a la vista para agregar una nueva amenidad
  this.router.navigate(['/admin/add-amenity']);
}

navigateToViewAllAmenities() {
  // Ir a la vista para ver todas las amenidades
  this.router.navigate(['/admin/view-all-amenities']);
}

navigateToMapGuards() {
  // Ir a la vista del mapa con todos los guardias
  this.router.navigate(['/map-guards']);
}

navigateToAddProperty() {
  // Ir a la vista para agregar una nueva propiedad
  this.router.navigate(['/admin/add-property']);
}

  // ====================================================
  // MÉTODOS EXISTENTES
  // ====================================================

  private getCountriesFromDB() {
    this.countriesService.getAll().subscribe({
      next: (data) => {
        this.countries = (data as CountryInteface[]).filter(country => {
          return country.isActive !== false;
        });
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  saveCountryLocalStorage(country: CountryInteface) {
    this.countryStorage.saveCountry(country);
  }

  async openPopover(country: CountryInteface, ev: any) {
    const popover = await this.popoverController.create({
      component: CountryPopoverComponent,
      event: ev,
      translucent: true,
      componentProps: {
        country: country
      }
    });

    popover.onDidDismiss().then((data) => {
      if (data?.data?.deleted) {
        this.getCountriesFromDB();
      }
    });

    return await popover.present();
  }

  private async handleError(error: any) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: 'No se pudieron cargar los países. Por favor, intente nuevamente.',
      buttons: ['OK']
    });

    await alert.present();
    console.error('Error al cargar países:', error);
  }

  getCountryImage(country: CountryInteface): string {
    return country.avatar || country.image || 'https://ionicframework.com/docs/img/demos/card-media.png';
  }
}*/