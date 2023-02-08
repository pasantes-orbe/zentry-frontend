import { Component, OnInit, ViewChild } from '@angular/core';
import { io, Socket } from 'socket.io-client'; 
import { environment } from 'src/environments/environment';
import { NavbarDefaultComponent } from '../components/navbars/navbar-default/navbar-default.component';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  @ViewChild('navbar') navbar: NavbarDefaultComponent
  private socket: Socket;

  constructor() {
    this.socket = io(environment.URL)
  }

  ngOnInit(): void {

    this.socket.on('notificacion-check-in', async (payload) =>{
      await this.navbar.ngOnInit()
  })

  this.socket.on('notificacion-nuevo-confirmedByOwner', async (payload) =>{
    await this.navbar.ngOnInit()
})

  }
  

}
