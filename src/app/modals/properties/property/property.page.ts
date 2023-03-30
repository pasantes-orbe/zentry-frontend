import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { AuthStorageService } from 'src/app/services/storage/auth-storage.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-property',
  templateUrl: './property.page.html',
  styleUrls: ['./property.page.scss'],
})
export class PropertyPage implements OnInit {

  @Input("property_id") property_id;
  private formBuilder: FormBuilder;
  private form: FormGroup;
  public propertyName;
  public addressProperty;
  public numberProperty;
  public avatarProperty;
  public img;
  newImg: string | ArrayBuffer;


  constructor(
    protected _formBuilder: FormBuilder,
    private propertiesService: PropertiesService,
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private authStorageService: AuthStorageService
    ) {
    this.formBuilder = _formBuilder;
    this.form = this.createForm();
   }

  ngOnInit() {

    this.propertiesService.getOneProperty(this.property_id).then(
      res => res.subscribe( 
        res2 => {
          console.log(res2);

          this.form.controls['propertyName'].setValue(res2['name']);
          this.form.controls['propertyAddress'].setValue(res2['address']);
          this.form.controls['propertyNumber'].setValue(res2['number']);
        }
      )
    )

  }


  onFileChange(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = e => this.newImg = reader.result;

    reader.readAsDataURL(file);

    if (event.target.files.length > 0) {


      const file = event.target.files[0];
      this.form.patchValue({
        fileSource: file
      });
    }
  }
  

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss('asdfasdf', 'confirm');
  }

  private createForm(): FormGroup{
    return this.formBuilder.group({
      propertyName: ['', [Validators.required, Validators.minLength(5)]],
      propertyAddress:['', [Validators.required, Validators.minLength(5)]],
      propertyNumber:['', [Validators.required, Validators.max(10000)]],
    });
  }
  
  public getForm(): FormGroup {
    return this.form;
  }

  async correctlyToast() {
    const toast = await this.toastController.create({
      message: 'Cambios guardados correctamente!',
      duration: 3000,
      position: 'bottom'
    });

    await toast.present();
  }

  async errorToast() {
    const toast = await this.toastController.create({
      header: 'Ha ocurrido un error al cambiar los horarios!',
      message: 'Por favor intente nuevamente',
      duration: 3000,
      position: 'bottom'
    });

    await toast.present();
  }

  async editProperty(){
    const token = await this.authStorageService.getJWT()

    this.propertiesService.editProperty(
      token,
      this.property_id,
      this.form.get('propertyName').value,
      this.form.get('propertyNumber').value,
      this.form.get('propertyAddress').value,)
      .subscribe( 
        async (res) => {
          console.log(res)
          await this.correctlyToast()

        },
        async(error) => {
          console.log(error);
          await this.errorToast()
        }
          )

  }

}
