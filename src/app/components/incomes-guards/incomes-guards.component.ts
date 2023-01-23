import { Component, OnInit } from '@angular/core';
import { CheckInInterfaceResponse } from 'src/app/interfaces/checkIn-interface';
import { CheckInService } from 'src/app/services/check-in/check-in.service';
import { CheckInOrOut } from '../../interfaces/checkInOrOut-interface';
import { AlertController } from '@ionic/angular';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';


@Component({
  selector: 'app-incomes-guards',
  templateUrl: './incomes-guards.component.html',
  styleUrls: ['./incomes-guards.component.scss'],
})
export class IncomesGuardsComponent implements OnInit {

  protected checkIn: CheckInOrOut[] 

  constructor(private _checkInService: CheckInService, protected alertController: AlertController, protected _socketService: WebSocketService) { 
  }

  ngOnInit() {
    this._checkInService.getAllCheckInConfirmedByOwner().subscribe(res =>{
      console.log(res),
      this.checkIn = res
    }
    )  
    
  }

  ionViewWillEnter(){
   this.ngOnInit()
  }

  public async checkInSelected(e, index){

    console.log(index)
    const alert = await this.alertController.create({
      header: 'Confirmar Check In',
      message: `Persona: ${e.guest_name}<br>DNI: ${e.DNI}`,
      buttons: [
        {
          text:'Check In',
          handler: () => {
            this._checkInService.updateCheckInTrue(e.id)
            this._socketService.notificarNuevoConfirmedByOwner("Actualizar Lista")
            this.checkIn.splice(index,1)
          }
        }, 'Cancelar'],
    });

    

    await alert.present();



  }

  actualizarListaCheckIn(){
    setTimeout(() => {
      this._checkInService.getAllCheckInConfirmedByOwner().subscribe(
        res =>{
          console.log(res),
          this.checkIn = res
        }
      )
    }
    , 1000);


    
}

}