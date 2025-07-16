import { Component, OnInit } from '@angular/core';
import { OwnersService } from '../../../../services/owners/owners.service';
import { OwnerResponse } from '../../../../interfaces/ownerResponse-interface';
import { ModalController } from '@ionic/angular';
import { EditPage } from 'src/app/modals/owners/edit/edit.page';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {

  // CORRECCIÓN 1: Se cambia 'protected' a 'public' y se inicializa el array.
  // La propiedad debe ser pública para que la plantilla HTML pueda acceder a ella.
  public owners: OwnerResponse[] = [];

  // CORRECCIÓN 2: Se declara la propiedad 'searchKey' que faltaba.
  // Esta propiedad es necesaria para el [(ngModel)] de la barra de búsqueda en el HTML.
  public searchKey: string = '';

  // Se inyecta ModalController como público para que sea accesible si es necesario.
  constructor(
    private _ownersService: OwnersService,
    public modalCtrl: ModalController
  ) { }

  ngOnInit() {
    // Se llama al método de carga de datos.
    this.loadOwners();
  }

  ionViewWillEnter() {
    // Se recargan los datos cada vez que se entra a la vista.
    this.loadOwners();
  }

  // Se encapsula la lógica de carga en un método async/await para mayor claridad.
  async loadOwners() {
    try {
      const ownersObservable = await this._ownersService.getAllByCountryID();
      ownersObservable.subscribe(owners => {
        this.owners = owners;
        console.log(owners);
      });
    } catch (error) {
      console.error("Error al cargar los propietarios:", error);
    }
  }

  async editUser(id_owner: number, index: number) {
    console.log(id_owner, index);

    const modal = await this.modalCtrl.create({
      component: EditPage,
      componentProps: {
        id_owner: id_owner
      }
    });

    await modal.present();

    // El manejo de los datos de retorno del modal se puede añadir aquí si es necesario.
    const { data, role } = await modal.onWillDismiss();

    // Si el modal se cerró con un rol de 'confirm' (o cualquier otro que uses para confirmar cambios),
    // se recargan los datos para reflejar las actualizaciones.
    if (role === 'confirm') {
      console.log('Modal cerrado con datos, recargando lista...');
      this.loadOwners();
    }
  }
}