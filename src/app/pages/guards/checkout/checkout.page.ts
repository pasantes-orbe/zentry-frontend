import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { CheckInOrOut } from '../../../interfaces/checkInOrOut-interface';
import { CheckInService } from '../../../services/check-in/check-in.service';
import { CheckoutService } from '../../../services/checkout/checkout.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {

  protected checkOutList : CheckInOrOut[]

  constructor(
    private alertController: AlertController,
    private _checkInService: CheckInService,
    private _checkOutService:CheckoutService
  ) { }

  ngOnInit() {
    this._checkInService.getAllCheckInApproved().subscribe(res => this.checkOutList = res)
  }

  ionViewWillEnter(){
    this.ngOnInit()
  }

  public async checkOut(e){


    const alert = await this.alertController.create({
      header: 'Confirmar Check Out',
      message: `Persona: ${e.guest_name}<br>DNI: ${e.DNI}`,
      buttons: [
        {
          text:'Check Out',
          handler: (data) => {
            console.log("CHECKOUT CONFIRMADO..", data)
            this._checkOutService.createCheckout(e.id, data)
            
          }
        }, 'Cancelar'],
      inputs: [
        {
          type: 'textarea',
          name: 'observation',
          placeholder: 'Añadir una observación:',
        },
      ],
    });

    

    await alert.present();



  }

}
