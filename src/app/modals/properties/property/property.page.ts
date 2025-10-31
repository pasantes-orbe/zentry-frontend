// src/app/modals/properties/property/property.page.ts

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Se importan las herramientas para formularios reactivos
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

// Servicios de Ionic
import { ModalController, ToastController } from '@ionic/angular';

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
  selectedAvatarFile: File | null = null;
  avatarPreviewUrl: string = '';

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder, // Se inyecta el FormBuilder para crear el formulario
    private toastController: ToastController
  ) {
    // Registra los íconos que se usan en el HTML
    addIcons({ add, close, save });
  }

  ngOnInit() {
    // Comprueba si se pasaron datos para determinar si es modo edición o creación
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

  // Cierra el modal sin guardar cambios
  cancel() {
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

    // Devuelve los datos del formulario al componente que abrió el modal
    const formData = this.propertyForm.value as any;
    formData.avatarFile = this.selectedAvatarFile || null;
    formData.avatarPreviewUrl = this.avatarPreviewUrl || '';
    this.modalCtrl.dismiss(formData, 'submit');
  }

  // Manejar cambio de avatar y previsualizar
  onPropertyAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0] || null;
    this.selectedAvatarFile = file;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreviewUrl = String(reader.result || '');
      };
      reader.readAsDataURL(file);
    }
  }
}
