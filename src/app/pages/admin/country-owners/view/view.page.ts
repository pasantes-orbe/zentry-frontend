// src/app/pages/admin/country-owners/view/view.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// [INICIO CORRECCION] Se añade ModalController para abrir el modal de edición
import { IonicModule, AlertController, ToastController, ModalController } from '@ionic/angular';
// [FIN CORRECCION]
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { cameraOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';

// Componentes
import { NavbarBackComponent } from 'src/app/components/navbars/navbar-back/navbar-back.component';
// [INICIO CORRECCION] Se importa el modal de edición
import { EditPage } from 'src/app/modals/owners/edit/edit.page'; 
// [FIN CORRECCION]

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
  private tempAvatarUrls = new Map<number, string>();
  private pendingAvatarUserId: number | null = null;
  private pendingAvatarIndex: number | null = null;

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
    // [INICIO CORRECCION] Inyectar ModalController
    private modalCtrl: ModalController,
    // [FIN CORRECCION]
    private userSvc: UserService
  ) {
    addIcons({ cameraOutline });
  }

  public async deleteOwnerHard(userId: number, index: number) {
    if (!userId) return;
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar definitivamente?',
      message: 'Esta acción eliminará al propietario de forma permanente.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await firstValueFrom(this.userSvc.deleteUserById(Number(userId)));
              // Remover de la lista local
              if (index > -1 && index < this.owners.length) {
                this.owners.splice(index, 1);
                this.owners = [...this.owners];
              }
              const t = await this.toastCtrl.create({ message: 'Propietario eliminado.', duration: 1400, color: 'success' });
              await t.present();
            } catch (err) {
              console.error('Error eliminando propietario:', err);
              const t = await this.toastCtrl.create({ message: 'No se pudo eliminar el propietario.', duration: 1800, color: 'danger' });
              await t.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  public goToEditOwner(userId: number) {
    if (!userId) return;
    this.router.navigate(['/edit-owner', userId]);
  }

  public async toggleOwnerStatus(userId: number, isActive: boolean) {
    if (!userId) return;
    const enabling = !isActive;
    const header = enabling ? 'Habilitar propietario' : 'Inhabilitar propietario';
    const message = enabling
      ? '¿Está seguro que desea habilitar este propietario?'
      : '¿Está seguro que desea inhabilitar este propietario?';

    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: enabling ? 'Habilitar' : 'Inhabilitar',
          role: 'confirm',
          handler: async () => {
            try {
              await firstValueFrom(this.userSvc.updateUserStatus(userId, enabling));
              // Actualizar solo la fila correspondiente
              this.owners = this.owners.map((row: any) =>
                Number(row?.user?.id) === Number(userId)
                  ? { ...row, user: { ...row.user, isActive: enabling } }
                  : row
              );
              const t = await this.toastCtrl.create({
                message: enabling ? 'Propietario habilitado.' : 'Propietario inhabilitado.',
                duration: 1400,
                color: 'success',
              });
              await t.present();
            } catch (err) {
              console.error('Error cambiando estado del propietario:', err);
              const t = await this.toastCtrl.create({
                message: 'No se pudo cambiar el estado.',
                duration: 1800,
                color: 'danger',
              });
              await t.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }

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
  //   - Sequelize con alias:   raw.OwnerUser
  //   - Otros casos usados:    raw.user / raw.owner.user
  //   - Propiedad opcional (puede venir vacía)
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
// [INICIO CORRECCION] Implementar la apertura del modal y la actualización local tras el cierre
  public async editUser(userId: number, index: number) {
    if (!userId) return;

    // Crear el modal
    const modal = await this.modalCtrl.create({
      component: EditPage, // Usar el componente de edición como modal
      componentProps: { 
        id_owner: userId // Pasar el ID del propietario
      }
    });
    await modal.present();

    // Esperar a que el modal se cierre
    const { role, data: updatedOwnerUser } = await modal.onWillDismiss();

    // Si el modal se cierra con rol 'submit' y trae data (el objeto user actualizado)
    if (role === 'submit' && updatedOwnerUser) {
      // Actualizar la lista localmente
      this.owners = this.owners.map((ownerRow: any) => {
        // Buscar la fila que coincida con el ID del usuario actualizado
        if (Number(ownerRow?.user?.id) === Number(updatedOwnerUser.id)) {
          // Actualizar solo la parte 'user' del objeto 'ownerRow'
          return {
            ...ownerRow,
            user: {
              ...ownerRow.user, // Mantener campos no editables (ej: DNI, propiedad)
              ...updatedOwnerUser, // Sobrescribir con los nuevos valores
              avatar: this.normalizeAvatarUrl(updatedOwnerUser.avatar) // Asegurar URL normalizada
            }
          };
        }
        return ownerRow;
      });
    }
  }
// [FIN CORRECCION]

  public handleAvatarButtonClick(inputEl: HTMLInputElement) {
    try {
      console.log('[avatar] abrir selector de archivos');
      // Reset para permitir re-seleccionar el mismo archivo y disparar (change)
      inputEl.value = '';
      inputEl.click();
    } catch (e) {
      console.error('[avatar] no se pudo abrir el selector', e);
    }
  }

  public openGlobalFilePicker(userId: number, index: number) {
    try {
      console.log('[avatar] abrir selector global para userId', userId, 'index', index);
      this.pendingAvatarUserId = Number(userId) || null;
      this.pendingAvatarIndex = Number(index) || null;
      const input = document.getElementById('globalAvatarInput') as HTMLInputElement | null;
      if (input) {
        input.value = '';
        input.click();
      } else {
        console.warn('[avatar] no se encontró #globalAvatarInput');
      }
    } catch (e) {
      console.error('[avatar] error abriendo selector global', e);
    }
  }

  public onGlobalAvatarPicked(event: Event) {
    const uid = this.pendingAvatarUserId;
    const idx = this.pendingAvatarIndex;
    console.log('[avatar] onGlobalAvatarPicked -> uid', uid, 'idx', idx);
    if (uid == null || idx == null) {
      const input = event.target as HTMLInputElement;
      if (input) input.value = '';
      return;
    }
    this.onOwnerAvatarPicked(uid, idx, event);
  }

  public async onOwnerAvatarPicked(userId: number, index: number, event: Event) {
    try {
      const input = event.target as HTMLInputElement;
      const file = input?.files?.[0];
      console.log('[avatar] onOwnerAvatarPicked -> userId:', userId, 'index:', index, 'file?', !!file);
      if (!userId || !file) {
        if (input) input.value = '';
        if (!file) {
          const t = await this.toastCtrl.create({ message: 'No se seleccionó ningún archivo.', duration: 1200, color: 'medium' });
          await t.present();
        }
        return;
      }

      // Validar tipo y tamaño (5MB)
      if (!/^image\//i.test(file.type)) {
        const t = await this.toastCtrl.create({ message: 'Seleccioná una imagen válida.', duration: 1800, color: 'warning' });
        await t.present();
        input.value = '';
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        const t = await this.toastCtrl.create({ message: 'La imagen supera 5MB.', duration: 1800, color: 'warning' });
        await t.present();
        input.value = '';
        return;
      }

      // Previsualización temporal opcional
      let tempUrl: string | null = null;
      try {
        tempUrl = URL.createObjectURL(file);
        console.log('[avatar] preview tempUrl:', tempUrl);
        // Reemplazar avatar solo en esa fila
        this.owners = this.owners.map((row: any) =>
          Number(row?.user?.id) === Number(userId) ? { ...row, user: { ...row.user, avatar: tempUrl as string } } : row
        );
        // Guardar para revocarlo luego (si había uno previo, revocarlo primero)
        const prev = this.tempAvatarUrls.get(userId);
        if (prev) {
          try { URL.revokeObjectURL(prev); } catch {}
        }
        this.tempAvatarUrls.set(userId, tempUrl);
      } catch {}

      // Subir al servidor (Promise)
      console.log('[avatar] subiendo archivo...');
      await this.userSvc.uploadAvatarSmart(userId, file);

      // Obtener URL final desde backend y actualizar solo esa fila
      console.log('[avatar] subida ok, consultando usuario actualizado...');
      const refreshed: any = await firstValueFrom(this.userSvc.getUserByID(userId));
      let finalUrl = this.normalizeAvatarUrl(refreshed?.avatar || '');
      // Evitar cache del navegador agregando cache-busting por fila
      if (finalUrl) {
        const sep = finalUrl.includes('?') ? '&' : '?';
        finalUrl = `${finalUrl}${sep}v=${Date.now()}`;
      }
      if (finalUrl) {
        console.log('[avatar] finalUrl:', finalUrl);
        this.owners = this.owners.map((row: any) => this.normalizeOwnerAvatar(row, userId, finalUrl));
      }

      // Revocar cualquier URL temporal
      const tmp = this.tempAvatarUrls.get(userId);
      if (tmp) {
        try { URL.revokeObjectURL(tmp); } catch {}
        this.tempAvatarUrls.delete(userId);
      }

      const t = await this.toastCtrl.create({ message: 'Avatar actualizado.', duration: 1200, color: 'success' });
      await t.present();
    } catch (err) {
      console.error('Error subiendo avatar:', err);
      const t = await this.toastCtrl.create({ message: 'No se pudo actualizar la imagen.', duration: 2000, color: 'danger' });
      await t.present();
      // Revocar URL temporal si existiera
      const tmp = this.tempAvatarUrls.get(userId);
      if (tmp) {
        try { URL.revokeObjectURL(tmp); } catch {}
        this.tempAvatarUrls.delete(userId);
      }
    } finally {
      const input = event.target as HTMLInputElement;
      if (input) input.value = '';
    }
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
               await firstValueFrom(this.userSvc.updateUserStatus(userId, false)); 

              // Actualizar estado localmente tras inhabilitación
              this.owners = this.owners.map((ownerRow: any) => {
                if (Number(ownerRow?.user?.id) === userId) {
                  return { ...ownerRow, user: { ...ownerRow.user, isActive: false } };
                }
                return ownerRow;
              });

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