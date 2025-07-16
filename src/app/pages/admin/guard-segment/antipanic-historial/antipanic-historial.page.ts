import { Component, OnInit } from '@angular/core';
import { AntipanicService } from 'src/app/services/antipanic/antipanic.service';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

// Es una buena práctica definir una interfaz para la forma de tus datos.
interface AntipanicEvent {
  id: number;
  details: string | null;
  createdAt: string; // O Date, dependiendo de lo que devuelva tu API
  // Añade aquí otras propiedades que pueda tener un evento antipánico.
}

@Component({
  selector: 'app-antipanic-historial',
  templateUrl: './antipanic-historial.page.html',
  styleUrls: ['./antipanic-historial.page.scss'],
})
export class AntipanicHistorialPage implements OnInit {

  // CORRECCIÓN 1: Se cambia 'protected' a 'public' y se inicializa con un tipo.
  public antipanics: AntipanicEvent[] = [];

  // CORRECCIÓN 2: Se declara la propiedad 'searchKey' que faltaba para el buscador.
  public searchKey: string = '';

  constructor(
    private _antipanicService: AntipanicService,
    private _countryStorage: CountryStorageService,
    private _alertService: AlertService
  ) { }

  ngOnInit() {
    this.loadAntipanicEvents();
  }

  ionViewWillEnter() {
    this.loadAntipanicEvents();
  }

  async loadAntipanicEvents() {
    try {
      const country = await this._countryStorage.getCountry();
      if (!country || !country.id) {
        console.error("No se pudo obtener el país desde el storage.");
        return;
      }

      const id_country = country.id;
      this._antipanicService.getAllAntipanicByCountry(id_country).subscribe(
        antipanics => {
          // Se asegura de que los datos sean un array antes de intentar ordenarlos.
          if (Array.isArray(antipanics)) {
            // Se ordena de más reciente a más antiguo.
            this.antipanics = antipanics.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            console.log(this.antipanics);
          } else {
            this.antipanics = [];
          }
        },
        error => {
          console.error("Error al suscribirse a los eventos antipánico:", error);
          this.antipanics = [];
        }
      );
    } catch (error) {
      console.error("Error en loadAntipanicEvents:", error);
    }
  }

  showDetails(details: string | null) {
    console.log(details);
    if (!details || details.trim() === '') {
      this._alertService.showAlert("Sin Detalles", "Este evento antipánico no cuenta con detalles adicionales.",);
    } else {
      this._alertService.showAlert("Detalles del Evento", details,);
    }
  }
}
