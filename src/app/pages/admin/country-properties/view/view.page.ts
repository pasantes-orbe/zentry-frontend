import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';

// Servicios
import { PropertiesService } from 'src/app/services/properties/properties.service';
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
  imports: [CommonModule, IonicModule, FormsModule, RouterModule, NavbarBackComponent],
})
export class ViewPage implements OnInit {
  public properties: Property_OwnerInterface[] = [];
  public loading = true;
  public searchKey = '';

  // imagen por defecto para propiedades
  public defaultPropertyImg = 'https://ionicframework.com/docs/img/demos/card-media.png';

  private countryId: number | null = null;

  constructor(
    private propertiesService: PropertiesService,
    private modalCtrl: ModalController,
    private authStorage: AuthStorageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // si llega countryId por query param, lo usamos (flujo dashboard)
    const cid = this.route.snapshot.queryParamMap.get('countryId');
    this.countryId = cid ? Number(cid) : null;
    this.loadProperties();
  }

  ionViewWillEnter(): void {
    this.loadProperties();
  }

  async loadProperties(): Promise<void> {
    try {
      this.loading = true;

      // Tu servicio devuelve Observable<Property_OwnerInterface[]>
      const obs$ = await this.propertiesService.getAllProperty_OwnerByCountryID();

      obs$.subscribe({
        next: (rows) => {
          this.properties = Array.isArray(rows) ? rows : [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar propiedades:', err);
          this.properties = [];
          this.loading = false;
        },
      });
    } catch (error) {
      console.error('Error al preparar carga de propiedades:', error);
      this.properties = [];
      this.loading = false;
    }
  }

  // ============= Helpers de imagen =============
  public getPropImg(row: Property_OwnerInterface): string {
    const a = row?.property?.avatar;
    if (!a) return this.defaultPropertyImg;
    // si viniera relativa, la devolvemos tal cual
    return a.startsWith('http') ? a : a;
  }

  public getOwnerAvatar(o: any): string {
    return o?.user?.avatar || 'https://ionicframework.com/docs/img/demos/avatar.svg';
  }

  // ============= Acciones =============
  async editProperty(id: number | null | undefined, _index: number): Promise<void> {
    if (!id) return;
    const modal = await this.modalCtrl.create({
      component: PropertyPage,
      componentProps: { property_id: id },
    });
    await modal.present();
    const { role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.loadProperties();
    }
  }

  async deleteProperty(id: number | null | undefined, index: number): Promise<void> {
    if (!id) return;
    try {
      const token = await this.authStorage.getJWT();
      this.propertiesService.deleteProperty(id, token).subscribe({
        next: () => {
          this.properties.splice(index, 1);
        },
        error: (err) => console.error('Error al eliminar propiedad:', err),
      });
    } catch (error) {
      console.error('Error al eliminar propiedad:', error);
    }
  }

  // ============= Búsqueda (sin pipes) =============
  public get filteredProperties(): Property_OwnerInterface[] {
    const q = (this.searchKey || '').toLowerCase().trim();
    if (!q) return this.properties;

    return this.properties.filter((row) => {
      const numberStr = String(row?.property?.number ?? '').toLowerCase();
      const address = String(row?.property?.address ?? '').toLowerCase();

      const ownerHits = (row?.owners ?? []).some((o: any) => {
        const name = String(o?.user?.name ?? '').toLowerCase();
        const lastname = String(o?.user?.lastname ?? '').toLowerCase();
        const dni = String(o?.user?.dni ?? '').toLowerCase();
        return name.includes(q) || lastname.includes(q) || dni.includes(q);
      });

      return numberStr.includes(q) || address.includes(q) || ownerHits;
    });
  }

  // ============= Refresh =============
  public handleRefresh(event: any): void {
    setTimeout(() => {
      this.loadProperties();
      event.target.complete();
    }, 800);
  }
}
