import { Component, OnInit } from '@angular/core';
import { PropertiesService } from '../../../../services/properties/properties.service';
import { Property_OwnerInterface } from 'src/app/interfaces/property_owner-interface';
import { PropertyPage } from 'src/app/modals/properties/property/property.page';
import { ModalController } from '@ionic/angular';
import { AuthStorageService } from 'src/app/services/storage/auth-storage.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {

  // CORRECCIÓN: Propiedades cambiadas a 'public' para que el HTML pueda acceder a ellas.
  public properties: Property_OwnerInterface[] = [];
  public searchKey: string = '';
  public message = 'This modal example uses the modalController to present and dismiss modals.';

  constructor(
    private _propertiesService: PropertiesService,
    private modalCtrl: ModalController,
    private _authStorageService: AuthStorageService
  ) { }

  ngOnInit() {
    this.loadProperties();
  }

  ionViewWillEnter() {
    this.loadProperties();
  }

  async loadProperties() {
    try {
      const propertiesObservable = await this._propertiesService.getAllProperty_OwnerByCountryID();
      propertiesObservable.subscribe((property) => {
        this.properties = property;
        console.log(property);
      });
    } catch (error) {
      console.error("Error al cargar las propiedades:", error);
    }
  }

  // CORRECCIÓN: Se ajusta la firma de la función para que coincida con la llamada del HTML.
  // Ahora acepta dos argumentos, aunque solo usemos el primero.
  async editProperty(id: any, index: number) {
    console.log('Editando propiedad con ID:', id);

    const modal = await this.modalCtrl.create({
      component: PropertyPage,
      componentProps: {
        property_id: id
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.message = `Hello, ${data}!`;
      this.loadProperties(); // Recargamos las propiedades por si hubo cambios.
    }
  }

  async deleteProperty(id: number, index: number) {
    try {
      const token = await this._authStorageService.getJWT();
      // Se asume que el servicio devuelve un Observable.
      this._propertiesService.deleteProperty(id, token).subscribe(
        res => {
          console.log(res);
          this.properties.splice(index, 1);
        }
      );
    } catch (error) {
      console.error("Error al eliminar la propiedad:", error);
    }
  }
}
