import { Component, Input, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';

//Servicios
import { UserService } from 'src/app/services/user/user.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';

// Componentes
import { IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonDatetimeButton, IonModal, IonDatetime, IonIcon, IonToggle, IonGrid, IonRow, IonCol, IonAvatar, ModalController } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
  standalone: true,
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
    IonDatetimeButton,
    IonModal,
    IonDatetime,
    IonIcon,
    IonToggle,
    IonGrid,
    IonRow,
    IonCol,
    IonAvatar
  ]
})
export class EditPage implements OnInit {

  @Input("id_owner") id_owner: number;

  private readonly: boolean;
  private formBuilder: FormBuilder;
  private form: FormGroup;
  public user;
  public name;
  public lastname;
  public phone;
  public email;
  public birthday;

  constructor(
    protected _formBuilder: FormBuilder,
    private _userService: UserService,
    private _route: ActivatedRoute,
    private _router: Router,
    @Optional() private modalCtrl: ModalController,
    private _userStorage: UserStorageService,
    private toastController: ToastController,
  ) {
    this.formBuilder = _formBuilder;
    this.form = this.createForm();
  }

  // Subir avatar del propietario desde el modal
  onOwnerAvatarChange(event: Event) {
    // Función deshabilitada: no se permite subir avatar desde este formulario
    return;
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'warning') {
    try {
      const toast = await this.toastController.create({ message, duration: 2000, color });
      await toast.present();
    } catch {}
  }

  async ngOnInit() {
    // Si viene por ruta: /edit-owner/:id, tomar el parámetro
    if (!this.id_owner) {
      const idParam = this._route.snapshot.paramMap.get('id');
      if (idParam) {
        this.id_owner = Number(idParam);
      }
    }
    this._userService.getUserByID(this.id_owner).subscribe(
      res => {
        this.user = res
        this.form.controls['name'].setValue(res.name);
        this.form.controls['lastname'].setValue(res.lastname);
        this.form.controls['phone'].setValue(res.phone);
        this.form.controls['birthday'].setValue(res.birthday);
        this.form.controls['email'].setValue(res.email);
        this.form.controls['isActive'].setValue(!!res.isActive);

      }
    )
    // this.user = user
    // this.form.controls['name'].setValue(user.name);
    // this.form.controls['lastname'].setValue(user.lastname);
    // this.form.controls['phone'].setValue(user.phone);
    // this.form.controls['birthday'].setValue(user.birthday);
    // this.form.controls['email'].setValue(user.email);

    console.log(this.readonly);
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      name: [''],
      lastname: [''],
      phone: [''],
      birthday: [''],
      email: [''],
      isActive: [true]
    });
  }

  cancel() {
    if (this.modalCtrl) {
      return this.modalCtrl.dismiss(null, 'cancel');
    }
    this._router.navigate(['/admin/view-owners'], { replaceUrl: true });
  }

  updateOwner() {
    // this._userService.updateUser(this.user.id, 
    //                               this.form.get('name').value,
    //                               this.form.get('lastname').value,
    this._userService.updateUser(this.user.id,
      this.form.get('name').value,
      this.form.get('lastname').value,
      this.form.get('birthday').value,
      this.form.get('email').value,
      this.form.get('phone').value)

    // Actualizar estado (habilitado/inhabilitado) vía endpoint de status
    this._userService.updateUserStatus(this.user.id, !!this.form.get('isActive').value).subscribe();
    this.form.markAsPristine()
  }

  getDate(event) {
    const { value } = event.detail;
    console.log(value);
  }

  public getForm(): FormGroup {
    return this.form;
  }
}
