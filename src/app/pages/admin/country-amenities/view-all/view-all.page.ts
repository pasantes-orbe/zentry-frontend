import { Component, OnInit } from '@angular/core';
import { AmenitieService } from '../../../../services/amenities/amenitie.service';

// Es una buena práctica definir una interfaz para la forma de tus datos.
interface Amenity {
  id: number;
  name: string;
  // Añade aquí otras propiedades que pueda tener un amenity.
}

@Component({
  selector: 'app-view-all',
  templateUrl: './view-all.page.html',
  styleUrls: ['./view-all.page.scss'],
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
}

