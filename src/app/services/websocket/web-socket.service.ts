import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client'; 
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class WebSocketService {

  private socket: Socket;

constructor(){
  this.socket = io("http://localhost:3000")
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

  this.socket.on('disconnect', () =>
  {
      console.log("Desconectado del servidor")
      
  });
}



}
