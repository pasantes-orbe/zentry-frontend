import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { io, Socket } from 'socket.io-client'; 
import { environment } from 'src/environments/environment';
import { NavbarGuardsComponent } from 'src/app/components/navbars/navbar-guards/navbar-guards.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NavbarGuardsComponent
  ]
})
export class HomePage implements OnInit {

  private socket: Socket;
  @ViewChild('navbar') navbar : NavbarGuardsComponent

  constructor() {
    this.socket = io(environment.URL)
  }

  ngOnInit() {
    this.socket.on('notificacion-nuevo-confirmedByOwner', (payload) =>{
      setTimeout(async cb =>  await this.navbar.ngOnInit(), 1000)
    })
    
    this.socket.on('notificacion-antipanico', (payload) =>{
      setTimeout(async cb =>  await this.navbar.ngOnInit(), 1000)
    })
  }

}
