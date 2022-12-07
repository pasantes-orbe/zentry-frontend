import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { LoadingService } from 'src/app/services/helpers/loading.service';




@Component({
  selector: 'app-add-amenity',
  templateUrl: './add-amenity.page.html',
  styleUrls: ['./add-amenity.page.scss'],
})


export class AddAmenityPage implements OnInit {


private formBuilder: FormBuilder;
private form: FormGroup;
private errorMessage: any;

constructor(
  protected _formBuilder: FormBuilder,
  protected _loading: LoadingService,

  private _alertService: AlertService
){
  this.formBuilder = _formBuilder;
  this.form = this.createForm();
}

ngOnInit(): void {}

guardarAmenitie(){
  if (!this.getForm().valid) return;
  
  this._loading.startLoading("Aguarde un momento...");
  console.log(this.form.value)
  this.setErrorMessage(false);
  
  const amenitie = {
    name: this.getForm().get('name').value,
    address: this.getForm().get('address').value,
    image : this.getForm().get('image').value,
  }

  //this._amenitiesService.guardarAmenitie(amenitie).subscribe(
   // data => {
    //  this._loading.stopLoading();
     // this._alertService.showAlert('Hola', 'El mensaje ha sido enviado');
   // },
  //)

}

private createForm(): FormGroup {
  return this.formBuilder.group({
    name: ['', [Validators.required]],
    address: ['', [Validators.required]],
    image: ['hola.jpg']
  });
}

public getForm(): FormGroup {
  return this.form;
}

public getErrorMessage(): any {
  return this.errorMessage;
}

public setErrorMessage(errorMessage: any): void {
  this.errorMessage = errorMessage;
}

}
