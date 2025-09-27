import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';

// Servicios
import { PropertiesService } from '../../../../services/properties/properties.service';
import { AuthStorageService } from 'src/app/services/storage/auth-storage.service';

// Interfaces
import { Property_OwnerInterface } from 'src/app/interfaces/property_owner-interface';

// Componentes
import { NavbarBackComponent } from 'src/app/components/navbars/navbar-back/navbar-back.component';
import { PropertyPage } from 'src/app/modals/properties/property/property.page';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,
    NavbarBackComponent
  ]
})
export class ViewPage implements OnInit {
  public properties: Property_OwnerInterface[] = [];
  public loading = true;
  public searchKey = '';

  private countryId: number | null = null;

  constructor(
    private propertiesService: PropertiesService,
    private modalCtrl: ModalController,
    private authStorage: AuthStorageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // si llega countryId por query param, lo usamos (flujo dashboard)
    const cid = this.route.snapshot.queryParamMap.get('countryId');
    this.countryId = cid ? Number(cid) : null;
    this.loadProperties();
  }

  ionViewWillEnter() {
    this.loadProperties();
  }

  async loadProperties() {
    try {
      this.loading = true;

      // Si tu servicio ya expone este método filtrado por country, dale prioridad:
      // (ajusta el nombre si difiere en tu API/servicio)
      // const obs$ = this.propertiesService.getAllProperty_OwnerByCountryID(this.countryId);

      // Si tu servicio solo tiene un "get all", usa este:
      const obs$ = await this.propertiesService.getAllProperty_OwnerByCountryID();

      obs$.subscribe({
        next: (rows) => {
          // rows ya debería ser Property_OwnerInterface[]
          this.properties = Array.isArray(rows) ? rows : [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar propiedades:', err);
          this.properties = [];
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error al preparar carga de propiedades:', error);
      this.properties = [];
      this.loading = false;
    }
  }

  // Abrir modal para editar una propiedad
  async editProperty(id: number, index: number) {
    const modal = await this.modalCtrl.create({
      component: PropertyPage,
      componentProps: {
        property_id: id
      }
    });

    await modal.present();
    const { role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.loadProperties();
    }
  }

  // Eliminar propiedad
  async deleteProperty(id: number, index: number) {
    try {
      const token = await this.authStorage.getJWT();
      this.propertiesService.deleteProperty(id, token).subscribe({
        next: () => {
          this.properties.splice(index, 1);
        },
        error: (err) => {
          console.error('Error al eliminar propiedad:', err);
        }
      });
    } catch (error) {
      console.error('Error al eliminar propiedad:', error);
    }
  }

  // Búsqueda (sin FilterByPipe, todo en TS)
  public get filteredProperties(): Property_OwnerInterface[] {
  const q = (this.searchKey || '').toLowerCase().trim();
  if (!q) return this.properties;

  return this.properties.filter((row) => {
    // Convertimos siempre a string antes de usar toLowerCase
    const numberStr = String(row.property?.number ?? '').toLowerCase();
    const address = (row.property?.address ?? '').toLowerCase();

    // Buscar en owners[]
    const ownerHits = (row.owners ?? []).some((o) => {
      const name = (o.user?.name ?? '').toLowerCase();
      const lastname = (o.user?.lastname ?? '').toLowerCase();
      const dni = String(o.user?.dni ?? '').toLowerCase();
      return (
        name.includes(q) ||
        lastname.includes(q) ||
        dni.includes(q)
      );
    });

    return (
      numberStr.includes(q) ||
      address.includes(q) ||
      ownerHits
    );
  });
}


  // Refresh
  public handleRefresh(event: any) {
    setTimeout(() => {
      this.loadProperties();
      event.target.complete();
    }, 800);
  }
}
