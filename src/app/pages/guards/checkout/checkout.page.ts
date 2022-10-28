import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {

  public checkOutList = [
    {
      id: 1,
      name: "Alejandro Chicala",
      dni: 43112125,
      date: "25/10/2022",
      time: "12:22",
      authorizedBy: {
        id: 2,
        name: "Nombre Propietario",
        lastname: "Apellido Propietario",
        phone: "3624627173"
      }
    },
    {
      id: 2,
      name: "Javier Bernal",
      dni: 43112126,
      date: "25/10/2022",
      time: "12:22",
      authorizedBy: {
        id: 2,
        name: "Nombre Propietario 2",
        lastname: "Apellido Propietario 2",
        phone: "3624627173"
      }
    }
  ]

  constructor(
    private alertController: AlertController
  ) { }

  ngOnInit() {
  }

  public async checkOut(e){
    console.log(e);


    const alert = await this.alertController.create({
      header: 'Confirmar Check Out',
      message: `Persona: ${e.name}<br>DNI: ${e.dni}`,
      buttons: [
        {
          text:'Check Out',
          handler: (data) => {
            console.log("CHECKOUT CONFIRMADO..", data)
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
