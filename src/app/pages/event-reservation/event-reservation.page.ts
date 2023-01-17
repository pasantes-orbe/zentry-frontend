import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { AmenitieInterface } from 'src/app/interfaces/amenitie-interface';
import { AmenitieService } from 'src/app/services/amenities/amenitie.service';
import { ReservationsService } from 'src/app/services/amenities/reservations.service';

@Component({
  selector: 'app-event-reservation',
  templateUrl: './event-reservation.page.html',
  styleUrls: ['./event-reservation.page.scss'],
})
export class EventReservationPage implements OnInit {
  protected amenities: AmenitieInterface[]
  private formBuilder: FormBuilder;
  private form: FormGroup;
  constructor(private alertController: AlertController, private _amenitiesService: AmenitieService, protected _formBuilder: FormBuilder, private _reservationsService: ReservationsService) {
    this.formBuilder = _formBuilder;
    this.form = this.createForm();
   }

  ngOnInit() {
    this._amenitiesService.getAllByOwner().then(data => data.subscribe( amenities => {this.amenities = amenities
      console.log(amenities)}))
  }

  ionViewWillEnter(){
    this.ngOnInit()
  }

  async reservation(){

    const alert = await this.alertController.create({
      header: 'Solicitud Enviada',
      message: 'El estado de reserva permanecerá como "Pendiente" hasta que el administrador confirme la disponibilidad.',
      buttons: ['OK'],
    });

    await alert.present();

  }


  public createForm(): FormGroup{
    return this.formBuilder.group({
      amenitieID: ['', [Validators.required]],
      fecha: ['', [Validators.required]],
      detalles: ['', [Validators.required]]
    });
  }

  public getForm(): FormGroup {
    return this.form;
  }

  public saveAmenitie(){
    console.log(this.getForm().get('amenitieID').value)
    console.log(this.getForm().get('fecha').value)
    console.log(this.getForm().get('detalles').value)

    this._reservationsService.createReservation(this.getForm().get('amenitieID').value,
                                                this.getForm().get('fecha').value,
                                                this.getForm().get('detalles').value)
  }

}
