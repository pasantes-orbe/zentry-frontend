import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';

// Servicios
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { AuthStorageService } from 'src/app/services/storage/auth-storage.service';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user/user.service';
import { OwnersService } from 'src/app/services/owners/owners.service';

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
    private route: ActivatedRoute,
    private userService: UserService,
    private ownersService: OwnersService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // si llega countryId por query param, lo usamos (flujo dashboard)
    const cid = this.route.snapshot.queryParamMap.get('countryId');
    this.countryId = cid ? Number(cid) : null;
    this.loadProperties();
  }

  // Alternativa: usar el mismo origen que otras vistas (OwnersService) y mapear avatares por id_user
  private enrichFromOwnersService(): void {
    try {
      const owners$ = this.ownersService.getAllByCountry();
      owners$.subscribe({
        next: (list: any[]) => {
          const arr = Array.isArray(list) ? list : [];
          // construir mapa userId -> avatar normalizado
          const map = new Map<number, string>();
          arr.forEach((raw: any) => {
            const u = (raw?.OwnerUser || raw?.user || raw?.owner?.user || raw?.User || raw) as any;
            const uid = Number(u?.id ?? raw?.id_user ?? raw?.user_id);
            const a = this.normalizeAvatarUrl(u?.avatar || '');
            if (uid && a) map.set(uid, a);
          });

          if (map.size === 0) return;

          const updated = this.properties.map(row => {
            const owners = (row as any)?.owners || [];
            owners.forEach((o: any, oi: number) => {
              const u = this.getOwnerUser(o);
              const uid = Number(u?.id ?? o?.id_user ?? (o as any)?.user_id);
              const fromMap = uid ? map.get(uid) : undefined;
              if (fromMap) {
                if (!owners[oi].user) owners[oi].user = {} as any;
                owners[oi].user.avatar = fromMap;
              }
            });
            return row;
          });
          this.properties = [...updated];
          try { this.cdr.detectChanges(); } catch {}
        },
        error: () => {}
      });
    } catch {}
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
          const arr = Array.isArray(rows) ? rows : [];
          // Normalizar estructura básica antes de render
          this.properties = arr.map(rowRaw => {
            const row = this.unwrap(rowRaw);
            const prop = this.unwrap((row as any)?.property);
            const owners = Array.isArray((row as any)?.owners) ? (row as any).owners : [];
            return {
              ...row,
              property: {
                ...prop,
                avatar: this.normalizePropImg(this.unwrap(prop)?.avatar)
              },
              owners: (row as any)?.owners?.map((o: any) => {
                const oo = this.unwrap(o);
                const u = this.getOwnerUser(oo) || {};
                const uu = this.unwrap(u);
                const avatar = this.normalizeAvatarUrl(uu?.avatar ?? oo?.avatar ?? '');
                // asegurar que el user tenga id (copiar id_user si existe)
                const userId = Number(uu?.id ?? oo?.id_user ?? (oo as any)?.user_id);
                return {
                  ...oo,
                  user: { id: userId, ...(this.unwrap(oo?.user) || uu || {}), avatar }
                };
              }) || []
            } as any;
          });

          // Enriquecer (1): por usuarios directos
          this.enrichOwnerAvatars();
          // Enriquecer (2): espejar otras vistas usando OwnersService (avatar ya normalizado)
          this.enrichFromOwnersService();
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
    const url = this.normalizePropImg(a);
    return url || this.defaultPropertyImg;
  }

  public getOwnerAvatar(o: any): string {
    const u = this.getOwnerUser(o);
    const a = u?.avatar ?? o?.avatar ?? '';
    const url = this.normalizeAvatarUrl(a);
    return url || 'https://ionicframework.com/docs/img/demos/avatar.svg';
  }

  // ============= Acciones =============
  private getOwnerUser(o: any): any {
    const x = this.unwrap(o);
    const u = this.unwrap(x?.user) ?? this.unwrap(x?.OwnerUser) ?? x;
    return this.unwrap(u);
  }
  private unwrap<T = any>(obj: T): T {
    const anyObj: any = obj as any;
    return anyObj && typeof anyObj === 'object' && 'dataValues' in anyObj ? anyObj.dataValues : anyObj;
  }
  private normalizePropImg(a: any): string {
    if (!a || typeof a !== 'string' || a.length === 0) return '';
    if (/^https?:\/\//i.test(a)) return a;
    if (a.startsWith('/')) return `${environment.URL}${a}`;
    return `${environment.URL}/${a}`;
  }
  private normalizeAvatarUrl(a: any): string {
    if (!a || typeof a !== 'string' || a.length === 0) return '';
    if (/^https?:\/\//i.test(a)) return a;
    if (a.startsWith('/')) return `${environment.URL}${a}`;
    return `${environment.URL}/${a}`;
  }

  // Trae avatar para dueños que aún no lo tengan poblado
  private enrichOwnerAvatars(): void {
    const missing: Array<{ rowIdx: number; ownerIdx: number; userId: number }>= [];
    this.properties.forEach((row, ri) => {
      (row?.owners || []).forEach((o: any, oi: number) => {
        const u = this.getOwnerUser(o);
        const uid = Number(u?.id ?? o?.id_user ?? (o as any)?.user_id);
        const hasAvatar = !!(u?.avatar);
        if (uid && !hasAvatar) missing.push({ rowIdx: ri, ownerIdx: oi, userId: uid });
      });
    });

    // Evitar llamadas duplicadas por usuario
    const seen = new Set<number>();
    missing.forEach(item => {
      if (seen.has(item.userId)) return; seen.add(item.userId);
      this.userService.getUserByID(item.userId).subscribe((u: any) => {
        const url = this.normalizeAvatarUrl(u?.avatar || '');
        if (!url) return;
        // Actualizar todas las ocurrencias de ese userId en la grilla
        const updated = this.properties.map((row, ri) => {
          (row?.owners || []).forEach((o: any, oi: number) => {
            const uu = this.getOwnerUser(o);
            if (Number(uu?.id) === item.userId) {
              if (!this.properties[ri].owners[oi].user) this.properties[ri].owners[oi].user = {} as any;
              this.properties[ri].owners[oi].user.avatar = url;
            }
          });
          return row;
        });
        this.properties = [...updated];
        try { this.cdr.detectChanges(); } catch {}
      });
    });
  }
  async editProperty(id: number | null | undefined, index: number): Promise<void> {
    if (!id) return;
    // Buscar la propiedad actual para pasarla al modal
    const currentRow = this.properties.find(r => Number((r as any)?.property?.id) === Number(id));
    const property = currentRow?.property ? { ...currentRow.property } : null;

    const modal = await this.modalCtrl.create({
      component: PropertyPage,
      componentProps: { property },
    });
    await modal.present();

    const { role, data } = await modal.onWillDismiss();
    if (role === 'submit' && data) {
      try {
        const token = await this.authStorage.getJWT();
        const name = data.propertyName;
        const number = data.propertyNumber;
        const address = data.propertyAddress;
        this.propertiesService.editProperty(token, Number(id), name, number, address).subscribe({
          next: () => {
            // Actualizar localmente sin recargar toda la lista
            if (index > -1 && index < this.properties.length) {
              const row = this.properties[index];
              (row as any).property.name = name;
              (row as any).property.number = number;
              (row as any).property.address = address;
              this.properties[index] = { ...(row as any) };
            } else {
              this.loadProperties();
            }
          },
          error: (err) => {
            console.error('Error al actualizar propiedad:', err);
            this.loadProperties();
          }
        });
      } catch (e) {
        console.error('Error preparando actualización de propiedad:', e);
        this.loadProperties();
      }
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
