// src/app/modals/properties/property/property.page.ts

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Se importan las herramientas para formularios reactivos
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

// Servicios de Ionic
import { ModalController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { AuthStorageService } from 'src/app/services/storage/auth-storage.service';

// Componentes Standalone de Ionic para el template
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonInput,
  IonIcon,
  IonToggle,
  IonAvatar
} from '@ionic/angular/standalone';

// Íconos
import { addIcons } from 'ionicons';
import { add, close, save } from 'ionicons/icons';

@Component({
  selector: 'app-property',
  templateUrl: './property.page.html',
  styleUrls: ['./property.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // <-- Soluciona el error de [formGroup]

    // Componentes de Ionic que usa el HTML
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonLabel,
    IonInput,
    IonIcon,
    IonToggle,
    IonAvatar
  ]
})
export class PropertyPage implements OnInit {
  // Input para recibir los datos de la propiedad si se está editando
  @Input() property: any;

  propertyForm: FormGroup;
  isEditMode = false;
  isPageMode = false;
  selectedAvatarFile: File | null = null;
  avatarPreviewUrl: string = '';

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder, // Se inyecta el FormBuilder para crear el formulario
    private toastController: ToastController,
    private route: ActivatedRoute,
    private propertiesSvc: PropertiesService,
    private router: Router,
    private authStorage: AuthStorageService,
  ) {
    // Registra los íconos que se usan en el HTML
    addIcons({ add, close, save });
  }

  ngOnInit() {
    // Si viene por ruta /edit-property/:id, cargar propiedad
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId && !this.property) {
      this.isPageMode = true;
      const id = Number(paramId);
      if (Number.isFinite(id)) {
        // Inicializa el formulario vacío para evitar NG01052 mientras carga
        this.buildForm();
        (async () => {
          const obs = await this.propertiesSvc.getOneProperty(id);
          obs.subscribe({
            next: (prop: any) => {
              this.property = prop as any;
              this.isEditMode = !!this.property;
              this.buildForm();
              this.avatarPreviewUrl = (this.property?.avatar) || '';
            },
            error: () => {
              this.isEditMode = false;
              this.buildForm();
            }
          });
        })();
        return;
      }
    }
    // Fallback: modalidad anterior (modal con @Input)
    this.isEditMode = !!this.property;
    this.buildForm();
    this.avatarPreviewUrl = (this.property?.avatar) || '';
  }

  // Construye el formulario reactivo
  private buildForm(): void {
    this.propertyForm = this.formBuilder.group({
      propertyName: [this.property?.name || '', [Validators.required, Validators.maxLength(50)]],
      propertyAddress: [this.property?.address || '', [Validators.required, Validators.maxLength(50)]],
      propertyNumber: [this.property?.number || '', [Validators.required, Validators.pattern('^[0-9]+$')]],
      isActive: [typeof this.property?.isActive === 'boolean' ? this.property.isActive : true]
    });
  }

  // Devuelve la instancia del formulario para usar en el HTML
  public getForm(): FormGroup {
    return this.propertyForm;
  }

  // Cerrar: si es página, navegar; si es modal, dismiss
  cancel() {
    if (this.isPageMode) {
      this.router.navigate(['/admin/view-properties'], { replaceUrl: true });
      return;
    }
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  // CORRECCIÓN: Se renombra la función para que coincida con el HTML
  async editProperty() {
    if (this.propertyForm.invalid) {
      const toast = await this.toastController.create({
        message: 'Por favor, completa todos los campos requeridos.',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
      return;
    }

    const id = Number(this.property?.id || this.route.snapshot.paramMap.get('id'));
    const { propertyName, propertyAddress, propertyNumber } = this.propertyForm.value as any;
    const isActive = typeof this.property?.isActive === 'boolean' ? this.property.isActive : undefined;

    try {
      if (this.isPageMode && Number.isFinite(id)) {
        const token = await this.authStorage.getJWT();
        const obs = this.propertiesSvc.editProperty(token, id, propertyName, propertyNumber, propertyAddress, isActive);
        await firstValueFrom(obs as any);
        const ok = await this.toastController.create({ message: 'Propiedad actualizada.', duration: 1400, color: 'success' });
        await ok.present();
        // Volver al listado
        this.router.navigate(['/admin/view-properties'], { replaceUrl: true });
      } else {
        // Modal: devolver valores al caller
        const formData = this.propertyForm.value as any;
        formData.avatarFile = this.selectedAvatarFile || null;
        formData.avatarPreviewUrl = this.avatarPreviewUrl || '';
        this.modalCtrl.dismiss(formData, 'submit');
      }
    } catch (err: any) {
      const msg = err?.status === 400 ? 'Datos inválidos.' : 'No se pudo guardar la propiedad.';
      const t = await this.toastController.create({ message: msg, duration: 1800, color: 'danger' });
      await t.present();
    }
  }

  // Manejar cambio de avatar y previsualizar
  async onPropertyAvatarChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0] || null;
    this.selectedAvatarFile = file;
    const id = Number(this.property?.id);
    if (!id || !file) { if (input) input.value = ''; return; }

    // Validaciones
    if (!/^image\//i.test(file.type)) {
      const t = await this.toastController.create({ message: 'Seleccioná una imagen válida.', duration: 1800, color: 'warning' });
      await t.present();
      input.value = '';
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const t = await this.toastController.create({ message: 'La imagen supera 5MB.', duration: 1800, color: 'warning' });
      await t.present();
      input.value = '';
      return;
    }

    // Preview temporal
    let tempUrl: string | null = null;
    try {
      tempUrl = URL.createObjectURL(file);
      this.avatarPreviewUrl = tempUrl;
    } catch {}

    try {
      // Subir
      const upObs = await this.propertiesSvc.uploadPropertyAvatar(id, file);
      await firstValueFrom(upObs as any);
      // Refrescar propiedad
      const getObs = await this.propertiesSvc.getOneProperty(id);
      const refreshed: any = await firstValueFrom(getObs as any);
      this.property = refreshed;
      // Cache-busting
      if (this.property?.avatar) {
        const base: string = this.property.avatar;
        const sep = base.includes('?') ? '&' : '?';
        this.avatarPreviewUrl = `${base}${sep}v=${Date.now()}`;
      }
      const ok = await this.toastController.create({ message: 'Foto actualizada.', duration: 1200, color: 'success' });
      await ok.present();
    } catch (err: any) {
      const status = err?.status;
      const msg = status === 413 ? 'La imagen supera 5MB.' : 'No se pudo actualizar la imagen.';
      const t = await this.toastController.create({ message: msg, duration: 1800, color: status === 413 ? 'warning' : 'danger' });
      await t.present();
    } finally {
      if (tempUrl) { try { URL.revokeObjectURL(tempUrl); } catch {} }
      if (input) input.value = '';
    }
  }

  // Abrir selector de archivos para cambiar avatar
  openAvatarPicker(): void {
    try {
      const input = document.getElementById('propertyAvatarInput') as HTMLInputElement | null;
      if (input) {
        input.value = '';
        input.click();
      }
    } catch {}
  }
}
