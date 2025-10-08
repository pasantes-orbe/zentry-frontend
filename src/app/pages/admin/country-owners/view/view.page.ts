import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

// Componentes
import { NavbarBackComponent } from 'src/app/components/navbars/navbar-back/navbar-back.component';

// Servicios
import { OwnersService } from 'src/app/services/owners/owners.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

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

  // Estado
  owners: any[] = [];
  loading = true;

  // Filtro
  searchKey: string = '';

  // Contexto
  private countryId?: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ownersSvc: OwnersService,
    private countryStorage: CountryStorageService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    // 1) Leer countryId del query param si viene
    const qpId = this.route.snapshot.queryParamMap.get('countryId');
    if (qpId) this.countryId = Number(qpId);

    // 2) Si no vino en query param, intento storage
    if (!this.countryId) {
      try {
        const c = await this.countryStorage.getCountry();
        if (c?.id) this.countryId = Number(c.id);
      } catch { /* no-op */ }
    }

    this.loadOwners();
  }

  ionViewWillEnter() {
    this.loadOwners();
  }

  // ================================
  // CARGA DESDE BACKEND (GET)
  // ================================
  private async loadOwners(): Promise<void> {
    this.loading = true;

    try {
      // Preferimos el endpoint por country con fallback
      if (this.countryId) {
        try {
          const obs = this.ownersSvc.getAllByCountry(); // Opción A
          obs.subscribe({
            next: (data) => this.assignOwners(data),
            error: async () => {
              const obs2 = this.ownersSvc.getAllByCountryID();
              obs2.subscribe({
                next: (data2) => this.assignOwners(data2),
                error: () => this.loadAllOwnersFallback()
              });
            }
          });
          return;
        } catch {
          // si algo raro pasó antes, sigo al siguiente intento
        }
      }

      // Último recurso: todos los owners
      this.loadAllOwnersFallback();

    } catch (e) {
      console.error('Error en loadOwners:', e);
      this.owners = [];
      this.loading = false;
      const a = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudieron cargar los propietarios.',
        buttons: ['OK']
      });
      await a.present();
    }
  }

  private loadAllOwnersFallback() {
    this.ownersSvc.getAll().subscribe({
      next: (data) => this.assignOwners(data),
      error: async (err) => {
        console.error('Error cargando propietarios (fallback getAll):', err);
        this.owners = [];
        this.loading = false;
        const a = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudieron cargar los propietarios.',
          buttons: ['OK']
        });
        await a.present();
      }
    });
  }

  private assignOwners(rawData: any) {
    const arr = Array.isArray(rawData) ? rawData : [];
    this.owners = arr.map(this.normalizeOwner);
    this.loading = false;
  }

  // Normalizador defensivo para que el HTML no rompa si cambia el shape
  // Soporta:
  //  - Sequelize con alias:   raw.OwnerUser
  //  - Otros casos usados:    raw.user / raw.owner.user
  //  - Propiedad opcional (puede venir vacía)
  private normalizeOwner = (raw: any) => {
    const user = raw?.OwnerUser || raw?.user || raw?.owner?.user || {};
    const property =
      raw?.property ||
      raw?.owner?.property ||
      (Array.isArray(raw?.properties) ? raw.properties[0] : {}) ||
      {};

    return {
      id: raw?.id ?? user?.id ?? null,
      user: {
        id: user?.id ?? null,
        name: user?.name ?? '',
        lastname: user?.lastname ?? '',
        dni: user?.dni ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        avatar: user?.avatar ?? '',
        isActive: typeof user?.isActive === 'boolean' ? user.isActive : true
      },
      property: {
        id: property?.id ?? null,
        name: property?.name ?? '',
        address: property?.address ?? '',
        type: property?.type ?? ''
      }
    };
  };

  // ================================
  // NAVEGACIÓN / ACCIONES
  // ================================
  public editUser(userId: number, _index: number) {
    this.router.navigate(['/admin/editar-propietario', userId]);
  }

  // Placeholder (no hay endpoint de borrar propietario)
  public async deleteOwner(_ownerId: number, _index: number) {
    const t = await this.toastCtrl.create({
      message: 'Eliminar propietario aún no está disponible en el backend.',
      duration: 1500,
      color: 'medium'
    });
    await t.present();
  }

  // ================================
  // BÚSQUEDA / ORDEN / ESTADÍSTICAS
  // ================================
  get sortedOwners() {
    if (!this.owners) return [];
    return [...this.owners].sort((a, b) => {
      const lnA = (a.user?.lastname || '').localeCompare(b.user?.lastname || '');
      if (lnA !== 0) return lnA;
      return (a.user?.name || '').localeCompare(b.user?.name || '');
    });
  }

  get filteredAndSortedOwners() {
    let filtered = this.sortedOwners;
    const term = (this.searchKey || '').toLowerCase().trim();
    if (term) {
      filtered = filtered.filter((o: any) => {
        const u = o.user || {};
        const p = o.property || {};
        return (
          (u.lastname || '').toLowerCase().includes(term) ||
          (u.name || '').toLowerCase().includes(term) ||
          String(u.dni || '').includes(term) ||
          (p.name || '').toLowerCase().includes(term) ||
          (p.address || '').toLowerCase().includes(term) ||
          (p.type || '').toLowerCase().includes(term)
        );
      });
    }
    return filtered;
    }

  public getTotalOwnersCount(): number {
    return this.owners.length;
  }

  public getActiveOwnersCount(): number {
    return this.owners.filter((o: any) => !!o.user?.isActive).length;
  }

  public getOwnersByPropertyType(type: string): any[] {
    return this.owners.filter((o: any) => (o.property?.type || '').toLowerCase() === (type || '').toLowerCase());
  }

  public getPropertyTypes(): string[] {
    const types = this.owners.map((o: any) => o.property?.type || '').filter(Boolean);
    return [...new Set(types)].sort();
  }

  public handleRefresh(event: any) {
    setTimeout(() => {
      this.loadOwners();
      event.target.complete();
    }, 800);
  }

  public getOwnerAvatar(owner: any): string {
    return owner?.user?.avatar || 'https://ionicframework.com/docs/img/demos/avatar.svg';
  }
}
