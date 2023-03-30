import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PropertiesService } from 'src/app/services/properties/properties.service';
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


  constructor(
    protected _formBuilder: FormBuilder,
    private propertiesService: PropertiesService
    ) {
    this.formBuilder = _formBuilder;
    this.form = this.createForm();
   }

  ngOnInit() {

    this.propertiesService.getOneProperty(this.property_id).then(
      res => res.subscribe( 
        res2 => {
          console.log(res2);
          this.propertyName = res2['name']
          this.addressProperty = res2['address']
          this.avatarProperty = res2['avatar']
          this.numberProperty = res2['number']
        }
      )
    )

  }

  private createForm(): FormGroup{
    return this.formBuilder.group({
      propertyName: ['', [Validators.required, Validators.minLength(5)]],
      propertyAddress:['', [Validators.required, Validators.minLength(5)]],
      propertyNumber:['', [Validators.required, Validators.max(10000)]],
      propertyAvatar: new FormControl('', [Validators.required]),
      fileSource: new FormControl('', [Validators.required])
    });
  }
  

}
