import { Component, OnInit } from '@angular/core';
import { OwnersService } from '../../../../services/owners/owners.service';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { PropertyInterface } from '../../../../interfaces/property-interface';
import { OwnerInterface } from 'src/app/interfaces/owner-interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Property } from '../../../../interfaces/recurrents-interface';
import { LoadingService } from 'src/app/services/helpers/loading.service';
import { AlertService } from 'src/app/services/helpers/alert.service';

@Component({
  selector: 'app-assign-country-to-owner',
  templateUrl: './assign-country-to-owner.page.html',
  styleUrls: ['./assign-country-to-owner.page.scss'],
})

export class AssignCountryToOwnerPage implements OnInit {
  private formBuilder: FormBuilder;
  private form: FormGroup;
  private userID; 
  protected owners:  OwnerInterface[];
  protected properties: PropertyInterface[];


  constructor(   protected _loading: LoadingService, protected _formBuilder: FormBuilder, private _ownersService: OwnersService, private _propertiesService: PropertiesService) {
    this.formBuilder = _formBuilder;
    this.form = this.createForm();
   }

  ngOnInit() {
    this._ownersService.getAllByRole().subscribe(owners => this.owners = owners)
    this._propertiesService.getAll().then(data => data.subscribe(properties => this.properties = properties))
  }

  public getOwnerByNameOrID(event){
    console.log(event)
  }
  
  public createForm(): FormGroup{
    return this.formBuilder.group({
      user_id: ['', [Validators.required]],
      property_id: ['', [Validators.required]],
    })
  }

  public getForm(): FormGroup {
    return this.form;
  }

 public asignarPropiedadAlUsuario(){
    this._ownersService.relationWithProperty(this.getForm().get('user_id').value, this.getForm().get('property_id').value)
    console.log(this.getForm().get('user_id').value);
    console.log(this.getForm().get('property_id').value);
 }


}
