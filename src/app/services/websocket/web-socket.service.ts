import { Injectable, LOCALE_ID } from '@angular/core';
import { io, Socket } from 'socket.io-client'; 
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { CheckInInterfaceResponse } from 'src/app/interfaces/checkIn-interface';
import { AntipanicService } from '../antipanic/antipanic.service';
import { formatDate } from '@angular/common';
import { CheckInService } from '../check-in/check-in.service';
import { AlertService } from '../helpers/alert.service';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})

export class WebSocketService {

  private socket: Socket;
  private datePipeString: string;

constructor(
  private alertController: AlertController,
  private alerts: AlertService
){
  this.socket = io(environment.URL)
}

conectar(){
  this.socket.on('error', () =>
  {
      console.log("Sorry, there seems to be an issue with the connection!");
  });


  this.socket.on('connect_error', (err) =>
  {
      console.log("connect failed"+err);
  });


  this.socket.on('connect', () =>
  {
      console.log("CONECTADO AL SOCKET")
      
  });

}

  propietarioConectado(){
    this.socket.emit('propietario-conectado', {msg: "asdfasdf"})
  }


  newOwnerConnected(data){

    this.socket.emit('owner-connected', data)

  }

  notificarCheckIn(data){
    this.socket.emit('notificar-check-in', data)
  }
  

  notificarAntipanico(data){
    this.socket.emit('notificar-antipanico', data)
  }

  notificarNuevoConfirmedByOwner(data){
    this.socket.emit('notificar-nuevo-confirmedByOwner', data)
    console.log("SE ENVIIO", data);
  }

  disconnectGuardUbication(data){
    this.socket.emit('disconnectGuardUbication', data)
  }


   escucharNotificacionesCheckin(){
    this.socket.on('notificacion-check-in', async (payload) =>{
      console.log(payload)
      await this.alerts.presentAlert(payload)
    })
  }

  escucharNuevoConfirmedByOwner(){
    this.socket.on('notificacion-nuevo-confirmedByOwner', (payload) =>{
      console.log(payload['response']);
      return payload['response']
    })
    return false; 
  }

  escucharNotificacionesAntipanico(){
    this.socket.on('notificacion-antipanico', async (payload) =>{
      console.log(payload)
      const alert = await this.alerts.presentAlertPanic(payload)


      this.socket.on('notificacion-antipanico-finalizado', (payload) =>{
        console.log("ANTIPANICO ATENDIDO");
        alert.dismiss()
      })  

    })
  }

  


}
    
  
