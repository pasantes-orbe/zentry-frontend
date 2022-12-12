import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { LoadingService } from 'src/app/services/helpers/loading.service';
import { PropertiesService } from '../../../../services/properties/properties.service';
import { PropertyInterface } from '../../../../interfaces/property-interface';
import { RecurrentsService } from '../../../../services/recurrents/recurrents.service';

@Component({
  selector: 'app-add-recurrent',
  templateUrl: './add-recurrent.page.html',
  styleUrls: ['./add-recurrent.page.scss'],
})
export class AddRecurrentPage implements OnInit {
  private formBuilder: FormBuilder;
  private form: FormGroup;
  protected property: PropertyInterface
  protected termino: string;
  protected selectedValue;

  constructor(
    protected _formBuilder: FormBuilder,
    protected _loading: LoadingService,
    private _propertiesService: PropertiesService,
    private _recurrentsService: RecurrentsService
  ) { 
    this.formBuilder = _formBuilder;
    this.form = this.createForm();
  }

  ngOnInit() {
  }

  private createForm(): FormGroup{
    return this.formBuilder.group({
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      dni: ['', [Validators.required]],
      property: ['', [Validators.required]],
    })
  }

  public getForm(): FormGroup {
    return this.form;
  }

  public getProperties(termino){
  this._propertiesService.getByID(termino).then(data => data.subscribe(property => this.property = property))  
  }
  public mostrarEvento(event){
    console.log(event)
  }

  public saveRecurrent(){
    this._recurrentsService.addRecurrent( this.getForm().get('property').value,
                                          this.getForm().get('name').value,
                                          this.getForm().get('lastname').value,
                                          this.getForm().get('dni').value)

  }

}
