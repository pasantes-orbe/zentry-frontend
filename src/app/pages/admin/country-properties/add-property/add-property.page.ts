import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PropertiesService } from 'src/app/services/properties/properties.service';

@Component({
  selector: 'app-add-property',
  templateUrl: './add-property.page.html',
  styleUrls: ['./add-property.page.scss'],
})
export class AddPropertyPage implements OnInit {

  public newImg: any = "https://ionicframework.com/docs/img/demos/card-media.png";

  protected data: any ;

  private formBuilder: FormBuilder;
  private form: FormGroup;


  constructor(protected _formBuilder: FormBuilder, private _properties: PropertiesService,) {
      this.formBuilder = _formBuilder;
      this.form = this.createForm();
      this.data = {
        countryName: ''
    };
   }

  ngOnInit() {
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

  addProperty(){
    this._properties.addCountry(this.getForm().get('fileSource').value, this.getForm().get('propertyName').value, this.getForm().get('propertyAddress').value, this.getForm().get('propertyNumber').value)
  }

  public getForm(): FormGroup {
    return this.form;
  }

  private createForm(): FormGroup{
    return this.formBuilder.group({
      propertyName: ['', [Validators.required, Validators.minLength(3)]],
      propertyAddress:['', [Validators.required, Validators.minLength(5)]],
      propertyNumber:['', Validators.required],
      propertyAvatar: new FormControl('', [Validators.required]),
      fileSource: new FormControl('', [Validators.required])
    });

  }



}

