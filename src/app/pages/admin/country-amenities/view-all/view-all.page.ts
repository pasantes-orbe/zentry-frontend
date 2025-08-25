import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

//Servicios
import { AmenitieService } from '../../../../services/amenities/amenitie.service';

//Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";

// Interface para amenities
interface Amenity {
  id: number;
  name: string;
  address: string;
  avatar: string;
  isActive: boolean;
}

//Pipes
import { FilterByPipe } from '../../../../pipes/filter-by.pipe';

@Component({
  selector: 'app-view-all',
  templateUrl: './view-all.page.html',
  styleUrls: ['./view-all.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,
    NavbarBackComponent,
    FilterByPipe
  ]
})
export class ViewAllPage implements OnInit {

  public amenities: Amenity[] = [];
  public searchKey: string = '';

  constructor(private _amenitiesService: AmenitieService) { }

  ngOnInit() {
    this.loadAmenities();
  }

  ionViewWillEnter() {
    this.loadAmenities();
  }

  private async loadAmenities() {
    try {
      // DATOS MOCK PARA LA DEMO
      this.amenities = [
        {
          id: 1,
          name: 'SUM (Salón de Usos Múltiples)',
          address: 'Sector Central, Planta Baja',
          avatar: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop',
          isActive: true
        },
        {
          id: 2,
          name: 'Cancha de Fútbol',
          address: 'Campo Deportivo Norte',
          avatar: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=300&fit=crop',
          isActive: true
        },
        {
          id: 3,
          name: 'Cancha de Básquet',
          address: 'Polideportivo Central',
          avatar: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop',
          isActive: true
        },
        {
          id: 4,
          name: 'Campo de Golf',
          address: 'Sector Recreativo Este',
          avatar: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop',
          isActive: true
        },
        {
          id: 5,
          name: 'Quincho con Piscina',
          address: 'Área Recreativa Sur',
          avatar: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
          isActive: true
        },
        {
          id: 6,
          name: 'Centro Comunitario',
          address: 'Plaza Principal',
          avatar: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
          isActive: true
        }
      ];

      console.log('Amenities cargadas para demo:', this.amenities);

      // Código original comentado para mantener estructura
      /*
      const amenitiesObservable = await this._amenitiesService.getAll();
      amenitiesObservable.subscribe(amenities => {
        this.amenities = amenities;
        console.log(amenities);
      });
      */
    } catch (error) {
      console.error("Error al cargar los amenities:", error);
      // En caso de error, mantener datos mock
    }
  }

  // Getter para amenities filtradas
  public get filteredAmenities(): Amenity[] {
    if (!this.searchKey || this.searchKey.trim() === '') {
      return this.amenities;
    }

    const searchTerm = this.searchKey.toLowerCase().trim();
    return this.amenities.filter(amenity =>
      amenity.name.toLowerCase().includes(searchTerm) ||
      amenity.address.toLowerCase().includes(searchTerm)
    );
  }

  // Método para manejar refresh
  public handleRefresh(event: any) {
    setTimeout(() => {
      this.loadAmenities();
      event.target.complete();
    }, 1000);
  }

  // Método para obtener imagen con fallback
  public getAmenityImage(amenity: Amenity): string {
    return amenity.avatar || 'https://ionicframework.com/docs/img/demos/card-media.png';
  }

  // Método para contar amenities activas
  public getActiveAmenitiesCount(): number {
    return this.amenities.filter(amenity => amenity.isActive).length;
  }

  // Método para navegación (si es necesario)
  public navigateToAmenity(amenityId: number) {
    console.log('Navegando a amenity:', amenityId);
    // Implementar navegación si es necesaria
  }

  public getAmenities(): Amenity[] {
    return this.amenities;
  }

  public setAmenities(amenities: Amenity[]): void {
    this.amenities = amenities;
  }
}


/*import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

//Servicios
import { AmenitieService } from '../../../../services/amenities/amenitie.service';

//Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";

// Es una buena práctica definir una interfaz para la forma de tus datos.
interface Amenity {
  id: number;
  name: string;
  // Añade aquí otras propiedades que pueda tener un amenity.
}

//Pipes
import { FilterByPipe } from '../../../../pipes/filter-by.pipe';

@Component({
  selector: 'app-view-all',
  templateUrl: './view-all.page.html',
  styleUrls: ['./view-all.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,
    NavbarBackComponent,
    FilterByPipe
  ]
})
export class ViewAllPage implements OnInit {

  // CORRECCIÓN 1: Se cambia 'private' a 'public'.
  // Las propiedades usadas en el HTML deben ser públicas para que la plantilla pueda acceder a ellas.
  // También se le da un tipo y se inicializa como un array vacío.
  public amenities: Amenity[] = [];

  // CORRECCIÓN 2: Se declara la propiedad 'searchKey'.
  // Esta propiedad es necesaria para el [(ngModel)] de la barra de búsqueda en el HTML.
  public searchKey: string = '';

  constructor(private _amenitiesService: AmenitieService) { }

  ngOnInit() {
    // Se llama al método para cargar los datos cuando el componente se inicializa.
    this.loadAmenities();
  }

  // El hook ionViewWillEnter se usa para recargar los datos cada vez que la página se vuelve a mostrar.
  ionViewWillEnter() {
    this.loadAmenities();
  }

  // CORRECCIÓN 3: Se renombra el método y se mejora la lógica.
  // El nombre ahora es más claro y se usa async/await para un código más limpio.
  private async loadAmenities() {
    try {
      const amenitiesObservable = await this._amenitiesService.getAll();
      amenitiesObservable.subscribe(amenities => {
        this.amenities = amenities;
        console.log(amenities);
      });
    } catch (error) {
      console.error("Error al cargar los amenities:", error);
    }
  }

  // CORRECCIÓN 4: Se ajustan los métodos 'get' y 'set' (aunque no se usan en este caso).
  // Los tipos de datos se corrigen para que coincidan con la propiedad 'amenities'.

  public getAmenities(): Amenity[] {
    return this.amenities;
  }

  public setAmenities(amenities: Amenity[]): void {
    this.amenities = amenities;
  }
}*/

