import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
    private popoverController: PopoverController
  ) {}

  ngOnInit() {
    this.getCountriesFromDB();
  }

  ionViewWillEnter() {
    this.getCountriesFromDB();
  }

  private getCountriesFromDB() {
    this.countriesService.getAll().subscribe({
      next: (data) => {
        // Corregir el filtro - usar la propiedad correcta o manejar undefined
        this.countries = (data as CountryInteface[]).filter(country => {
          // Si no tiene la propiedad isActive, se considera activo por defecto
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
      // Si el popover devolvió que se borró algo, actualizamos la lista
      if (data?.data?.deleted) {
        this.getCountriesFromDB();
      }
    });

    return await popover.present();
  }

  // Método para manejar errores de manera centralizada
  private async handleError(error: any) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: 'No se pudieron cargar los países. Por favor, intente nuevamente.',
      buttons: ['OK']
    });

    await alert.present();
    console.error('Error al cargar países:', error);
  }

  // Método helper para obtener la imagen del país
  getCountryImage(country: CountryInteface): string {
    // Usar avatar si existe, sino usar image, sino una imagen por defecto
    return country.avatar || country.image || 'https://ionicframework.com/docs/img/demos/card-media.png';
  }
}