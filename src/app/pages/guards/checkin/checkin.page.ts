import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckinInterface } from './checkin.interface';
import { UserStorageService } from '../../../services/storage/user-storage.service';
import { GuardsService } from '../../../services/guards/guards.service';
import { GuardStorageService } from '../../../services/storage/guard-storage.service';
import { OwnersService } from '../../../services/owners/owners.service';
import { CountryStorageService } from '../../../services/storage/country-storage.service';
import { OwnerResponse } from '../../../interfaces/ownerResponse-interface';
import { CheckInService } from '../../../services/check-in/check-in.service';
import { IonSearchbar, IonSelect, IonTextarea } from '@ionic/angular';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';

@Component({
  selector: 'app-checkin',
  templateUrl: './checkin.page.html',
  styleUrls: ['./checkin.page.scss'],
})
export class CheckinPage implements OnInit {

  private formBuilder: FormBuilder;
  private form: FormGroup;

  protected incomeData: CheckinInterface;

  protected dateNow: String = new Date().toISOString();

  protected userID: any

  protected owners: OwnerResponse[]

  @ViewChild("textArea") protected textArea: IonTextarea;

  @ViewChild("searchBar") protected searchBar: IonSearchbar;

  @ViewChild("ionSelect") protected ionSelect: IonSelect;


  constructor(
    protected _formBuilder: FormBuilder,
    private _userStorageService: UserStorageService,
    private _guardsService: GuardsService,
    private _countryStorageService: CountryStorageService,
    private _ownersService: OwnersService,
    private _checkInService: CheckInService,
    private _socketService: WebSocketService

    ) {
      this.formBuilder = _formBuilder;
      this.form = this.createForm();
      this.incomeData = {    
        name: '',
        lastname: '',
        DNI: '',
        ownerID: '',
        date: '',
        transport: '',
        patent: '',
        observations: ''          
    }

    this.getIncomeData().date = this.dateNow;
  }

  async ngOnInit() {

    const user = await this._userStorageService.getUser()
    this.userID = user.id;

  }

  ionViewWillEnter(){
    this.ngOnInit()
  }

  select(e){
    this.getIncomeData().transport = e.detail.value;
  }


  setObservations(e){
    this.getIncomeData().observations = e.detail.value;
  }

  public setOwner(e){
    console.log(e.detail.value)
    this.getIncomeData().ownerID = e.detail.value
  }

  public getIncomeData(): CheckinInterface{
    return this.incomeData;
  }

  filtrarOwners(termino:string){

    if (termino.length > 3) {
      
      this._ownersService.getAllByCountryID().then(data => data.subscribe(owners =>{
        this.owners = owners;
      } ))

    }
  }

  submitIncome(){
    console.log(this.getForm().get('name').value,
      this.getForm().get('lastname').value,
      this.getForm().get('DNI').value,
      this.getForm().get('ownerID').value,
      this.userID,
      this.getForm().get('date').value,
      this.getIncomeData().observations,
      this.getIncomeData().transport,
      this.getIncomeData().patent,
      )

    this._checkInService.createCheckin(
      this.getForm().get('name').value,
      this.getForm().get('lastname').value,
      this.getForm().get('DNI').value,
      this.getForm().get('ownerID').value,
      this.userID,
      this.getForm().get('date').value,
      this.getIncomeData().observations,
      this.getIncomeData().transport,
      this.getIncomeData().patent,
    )
      
  
    this.form.reset();
    this.getIncomeData().observations = "";
    this.textArea.value = ""
    this.searchBar.value = ""
    this.ionSelect.value = ""
    this.getIncomeData().patent = ""


  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      lastname: ['', [Validators.required, Validators.minLength(3)]],
      DNI: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(9), Validators.pattern("^[0-9]*$")]],
      ownerID: ['', [Validators.required]],
      date: ['', [Validators.required]],
    });
  }

  public getForm(): FormGroup {
    return this.form;
  }

  getDate(event){
    
    const { value } = event.detail;

    console.log(value);

    this.getIncomeData().date = value;
    
  }

  getIncomeTime(event){
    const { value } = event.detail;

    console.log(value);
  }

  

}
