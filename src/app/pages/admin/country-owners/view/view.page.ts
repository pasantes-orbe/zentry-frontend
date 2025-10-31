import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

// Componentes
import { NavbarBackComponent } from 'src/app/components/navbars/navbar-back/navbar-back.component';

// Servicios
import { OwnersService } from 'src/app/services/owners/owners.service';
import { UserService } from 'src/app/services/user/user.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { environment } from 'src/environments/environment';

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
  public dashboardHref: string = '/admin/home';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ownersSvc: OwnersService,
    private countryStorage: CountryStorageService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private userSvc: UserService
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

    // 3) Definir destino de regreso al dashboard
    if (this.countryId) {
      this.dashboardHref = `/admin/country-dashboard/${this.countryId}`;
    } else {
      this.dashboardHref = '/admin/home';
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
    this.owners = arr
      .map(this.normalizeOwner)
      // Filtrar entradas sin usuario válido (evita "fantasmas" tras hard-delete antiguos)
      .filter((o: any) => Number(o?.user?.id) > 0);
    this.loading = false;
    // Enriquecer avatares desde /api/users/:id para asegurar URL actualizada (Cloudinary)
    this.enrichOwnerAvatars();
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
      id: user?.id ?? null,
      user: {
        id: user?.id ?? null,
        name: user?.name ?? '',
        lastname: user?.lastname ?? '',
        dni: user?.dni ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        avatar: this.normalizeAvatarUrl(user?.avatar ?? ''),
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

  private normalizeAvatarUrl(a: any): string {
    if (!a || typeof a !== 'string' || a.length === 0) return '';
    if (/^https?:\/\//i.test(a)) return a;
    if (a.startsWith('/')) return `${environment.URL}${a}`;
    return `${environment.URL}/${a}`;
  }

  // Trae y sincroniza el avatar actual desde /api/users/:id para cada owner
  private enrichOwnerAvatars(): void {
    try {
      // Evitar llamadas duplicadas por usuario
      const seen = new Set<number>();
      (this.owners || []).forEach((o: any, idx: number) => {
        const uid = Number(o?.user?.id);
        if (!uid || seen.has(uid)) return; seen.add(uid);
        this.userSvc.getUserByID(uid).subscribe((u: any) => {
          const url = this.normalizeAvatarUrl(u?.avatar || '');
          if (!url) return;
          // Actualizar todas las ocurrencias de ese uid en la lista
          const updated = this.owners.map((row: any) => this.normalizeOwnerAvatar(row, uid, url));
          this.owners = [...updated];
        });
      });
    } catch {}
  }

  // Reemplaza el avatar en el item cuyo user.id coincida
  private normalizeOwnerAvatar(row: any, uid: number, url: string): any {
    if (!row || !row.user) return row;
    if (Number(row.user.id) === uid) {
      return { ...row, user: { ...row.user, avatar: url } };
    }
    return row;
  }

  // ================================
  // NAVEGACIÓN / ACCIONES
  // ================================
  public editUser(userId: number, _index: number) {
    this.router.navigate(['/edit-owner', userId]);
  }

  public async deleteOwner(userId: number, index: number) {
    if (!userId) {
      const t = await this.toastCtrl.create({
        message: 'No se pudo inhabilitar: identificador de usuario inválido.',
        duration: 1800,
        color: 'warning'
      });
      await t.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Inhabilitar propietario',
      message: 'Esta acción inhabilitará al usuario. ¿Deseas continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Inhabilitar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.userSvc.updateUserStatus(userId, false).toPromise();
              const t = await this.toastCtrl.create({
                message: 'Propietario inhabilitado correctamente.',
                duration: 1500,
                color: 'success'
              });
              await t.present();
            } catch (err: any) {
              const status = err?.status;
              const msg = (status === 401 || status === 403)
                ? 'No autorizado para inhabilitar.'
                : status === 404
                  ? 'Usuario no encontrado.'
                  : 'Error al inhabilitar usuario.';
              const t = await this.toastCtrl.create({
                message: msg,
                duration: 2200,
                color: 'danger'
              });
              await t.present();
            }
          }
        }
      ]
    });
    await alert.present();
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
    // Mostrar activos primero y luego inhabilitados; aplicar búsqueda al conjunto
    let list = (this.owners || [])
      .map(this.normalizeOwner)
      .filter((o: any) => Number(o?.user?.id) > 0);

    const term = (this.searchKey || '').toLowerCase().trim();
    if (term) {
      list = list.filter((o: any) => {
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

    return [...list].sort((a: any, b: any) => {
      // Activos primero
      const aInactive = a?.user?.isActive === false ? 1 : 0;
      const bInactive = b?.user?.isActive === false ? 1 : 0;
      if (aInactive !== bInactive) return aInactive - bInactive;
      // Luego ordenar por apellido y nombre
      const lnA = (a.user?.lastname || '').localeCompare(b.user?.lastname || '');
      if (lnA !== 0) return lnA;
      return (a.user?.name || '').localeCompare(b.user?.name || '');
    });
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
    const a = owner?.user?.avatar;
    const url = this.normalizeAvatarUrl(a);
    return url || 'https://ionicframework.com/docs/img/demos/avatar.svg';
  }
}
