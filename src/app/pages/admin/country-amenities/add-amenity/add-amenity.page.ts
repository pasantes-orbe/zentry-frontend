import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { LoadingService } from 'src/app/services/helpers/loading.service';
import { AmenitieService } from '../../../../services/amenities/amenitie.service';




@Component({
  selector: 'app-add-amenity',
  templateUrl: './add-amenity.page.html',
  styleUrls: ['./add-amenity.page.scss'],
})


export class AddAmenityPage implements OnInit {

public newImg: any = 'https://ionicframework.com/docs/img/demos/card-media.png';
private formBuilder: FormBuilder;
private form: FormGroup;
private errorMessage: any;

constructor(
  protected _formBuilder: FormBuilder,
  protected _loading: LoadingService,
  private _alertService: AlertService,
  private _amenitie: AmenitieService
){
  this.formBuilder = _formBuilder;
  this.form = this.createForm();
}

ngOnInit(): void {}

saveAmenitie(){
  this._amenitie.addAmenitiy(this.getForm().get('name').value,
  this.getForm().get('address').value,
  this.getForm().get('fileSource').value,);
}

private createForm(): FormGroup {
  return this.formBuilder.group({
    name: ['', [Validators.required]],
    address: ['', [Validators.required]],
    amenitieAvatar: new FormControl('', [Validators.required]),
    fileSource: new FormControl('', [Validators.required]),
  });
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
public getForm(): FormGroup {
  return this.form;
}


}
