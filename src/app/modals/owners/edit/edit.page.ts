// src/app/modals/owners/edit/edit.page.ts
import { Component, Input, OnDestroy, OnInit, Optional, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { Subscription, firstValueFrom } from 'rxjs';

// Servicios
import { UserService } from 'src/app/services/user/user.service';

// Componentes
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonIcon,
  IonAvatar,
  IonGrid,
  IonRow,
  IonCol,
  ModalController,
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonIcon,
    IonAvatar,
    IonGrid,
    IonRow,
    IonCol,
  ],
})
export class EditPage implements OnInit, OnDestroy {
  @Input('id_owner') id_owner!: number;

  public form: FormGroup;
  public user: any;
  private userSubscription?: Subscription;
  public avatarUrl: string = '';

  constructor(
    protected _formBuilder: FormBuilder,
    private _userService: UserService,
    private _route: ActivatedRoute,
    private _router: Router,
    @Optional() private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private toastController: ToastController,
  ) {
    this.form = this.createForm();
    addIcons({ checkmarkCircleOutline });
  }

  private loadUserData(): void {
    // Suscripción (se limpia en ngOnDestroy)
    this.userSubscription = this._userService.getUserByID(this.id_owner).subscribe({
      next: (res) => {
        this.user = res;
        this.form.patchValue({
          name: res?.name ?? '',
          lastname: res?.lastname ?? '',
          phone: res?.phone ?? '',
          birthday: res?.birthday ?? '',
          email: res?.email ?? '',
        });
        this.updateAvatarUrl();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error obteniendo propietario:', err);
        this.presentToast('No se pudo cargar el propietario.', 'danger');
      },
    });
  }

  private async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'warning',
  ) {
    try {
      const toast = await this.toastController.create({ message, duration: 2000, color });
      await toast.present();
    } catch (e) {
      // Evita romper el flujo si no se puede mostrar el toast
      console.error('Error mostrando toast:', e);
    }
  }

  ngOnInit(): void {
    // Si viene por ruta: /edit-owner/:id, tomar el parámetro
    if (!this.id_owner) {
      const idParam = this._route.snapshot.paramMap.get('id');
      if (idParam) this.id_owner = Number(idParam);
    }

    if (!Number.isFinite(this.id_owner)) {
      // Defensa extra ante un id inválido
      this.presentToast('ID de propietario inválido.', 'danger');
      return;
    }

    // Cargar datos inmediatamente al iniciar para asegurar que el formulario aparezca
    this.loadUserData();
  }

  ngOnDestroy(): void {
    // Desuscribirse para prevenir fugas de memoria
    this.userSubscription?.unsubscribe();
  }

  private createForm(): FormGroup {
    return this._formBuilder.group({
      name: [''],
      lastname: [''],
      phone: [''],
      birthday: [''],
      email: [''],
    });
  }

  private updateAvatarUrl(): void {
    const a: string = this.user?.avatar || '';
    if (!a) {
      this.avatarUrl = 'https://ionicframework.com/docs/img/demos/avatar.svg';
      return;
    }
    try {
      const isAbs = /^https?:\/\//i.test(a);
      this.avatarUrl = isAbs ? a : (a.startsWith('/') ? `${location.origin}${a}` : a);
    } catch {
      this.avatarUrl = a;
    }
  }

  cancel(): void {
    if (this.modalCtrl) {
      this.modalCtrl.dismiss(null, 'cancel');
      return;
    }
    this._router.navigate(['/admin/view-owners'], { replaceUrl: true });
  }

  async updateOwner(): Promise<boolean> {
    if (!this.user?.id) {
      await this.presentToast('No se encontró el propietario a actualizar.', 'danger');
      return false;
    }

    const id = Number(this.user.id);
    const updatedName = this.form.get('name')?.value;
    const updatedLastname = this.form.get('lastname')?.value;
    const updatedBirthday = this.form.get('birthday')?.value;
    const updatedEmail = this.form.get('email')?.value;
    const updatedPhone = this.form.get('phone')?.value;

    let updateSuccessful = false;

    // 1) Actualizar datos básicos
    try {
      await firstValueFrom(
        this._userService.updateUser(
          id,
          updatedName,
          updatedLastname,
          updatedBirthday,
          updatedEmail,
          updatedPhone,
        ),
      );
      updateSuccessful = true;
    } catch (error) {
      console.error('Error al actualizar datos básicos del propietario:', error);
      await this.presentToast('No se pudieron guardar los datos del propietario.', 'danger');
      return false;
    }

    // Sincronizar entidad local con el formulario
    this.user = {
      ...this.user,
      name: updatedName,
      lastname: updatedLastname,
      birthday: updatedBirthday,
      email: updatedEmail,
      phone: updatedPhone,
    };

    if (updateSuccessful) {
      await this.presentToast('Propietario actualizado correctamente.', 'success');
    }

    this.form.markAsPristine();

    // 4) Cerrar Modal / Navegar
    if (updateSuccessful) {
      if (this.modalCtrl) {
        this.modalCtrl.dismiss(this.user, 'submit');
      } else {
        this._router.navigate(['/admin/view-owners'], { replaceUrl: true });
      }
    }

    return updateSuccessful;
  }

  getDate(event: any): void {
    const { value } = event.detail || {};
    console.log(value);
  }

  public getForm(): FormGroup {
    return this.form;
  }

  public openAvatarPicker() {
    try {
      const input = document.getElementById('ownerAvatarInput') as HTMLInputElement | null;
      if (input) {
        input.value = '';
        input.click();
      }
    } catch {}
  }

  public async onAvatarPicked(event: Event) {
    try {
      const input = event.target as HTMLInputElement;
      const file = input?.files?.[0];
      if (!this.user?.id || !file) {
        if (input) input.value = '';
        return;
      }

      // Validaciones
      if (!/^image\//i.test(file.type)) {
        await this.presentToast('Seleccioná una imagen válida.', 'warning');
        input.value = '';
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        await this.presentToast('La imagen supera 5MB.', 'warning');
        input.value = '';
        return;
      }

      // Preview temporal
      let tempUrl: string | null = null;
      try {
        tempUrl = URL.createObjectURL(file);
        this.avatarUrl = tempUrl;
        this.cdr.markForCheck();
      } catch {}

      // Subir
      await this._userService.uploadAvatarSmart(Number(this.user.id), file);

      // Refrescar usuario
      const refreshed: any = await firstValueFrom(this._userService.getUserByID(Number(this.user.id)));
      this.user = refreshed;
      // Cache busting
      if (this.user?.avatar) {
        const base = this.user.avatar as string;
        const sep = base.includes('?') ? '&' : '?';
        this.avatarUrl = `${base}${sep}v=${Date.now()}`;
      } else {
        this.updateAvatarUrl();
      }
      this.cdr.markForCheck();
      await this.presentToast('Avatar actualizado.', 'success');

      // Revocar preview
      if (tempUrl) {
        try { URL.revokeObjectURL(tempUrl); } catch {}
      }

    } catch (err: any) {
      const status = err?.status;
      if (status === 413) {
        await this.presentToast('La imagen supera 5MB.', 'warning');
      } else {
        await this.presentToast('No se pudo actualizar la imagen.', 'danger');
      }
    } finally {
      const input = event.target as HTMLInputElement;
      if (input) input.value = '';
    }
  }
}


