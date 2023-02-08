import { Component, ViewChild, OnInit } from '@angular/core';
import { OwnerResponse } from '../interfaces/ownerResponse-interface';
import { UserInterface } from '../interfaces/user-interface';
import { io, Socket } from 'socket.io-client'; 
import { environment } from 'src/environments/environment';
import { UserStorageService } from '../services/storage/user-storage.service';
import { OwnersService } from '../services/owners/owners.service';
import { OwnerStorageService } from '../services/storage/owner-interface-storage.service';
import { AlertService } from '../services/helpers/alert.service';
import { WebSocketService } from '../services/websocket/web-socket.service';
import { NavbarDefaultComponent } from '../components/navbars/navbar-default/navbar-default.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{
  private loading: boolean;
  private user: UserInterface;
  private userID;
  protected owner: OwnerResponse;
  private socket: Socket;
  private recurrentsState: boolean = false;


  @ViewChild('incomesComponent') incomesComponent;
  
  constructor(
    private _userStorageService: UserStorageService,
    private _ownersService: OwnersService,
    private _ownerStorageService: OwnerStorageService,
    private alerts: AlertService
  ) {
    this.socket = io(environment.URL)

  }

  async ngOnInit() {
    const user = await this._userStorageService.getUser()
    this.userID = user.id;
    this._ownersService.getByID(this.userID).subscribe((owner) => {
      this.owner = owner
      this._ownerStorageService.saveOwner(owner)
    })
    this.nuevoPropietarioConectado()
    this.escucharNotificacionesCheckin()
  }

  ionViewWillEnter(){
    this.incomesComponent.ngOnInit()
  }


  async escucharNotificacionesCheckin(){
    this.socket.on('notificacion-check-in', async (payload) =>{
      console.log(payload)
      await this.alerts.presentAlert(payload)
      this.incomesComponent.ngOnInit()
    })
  }

  async nuevoPropietarioConectado(){
    this.socket.emit('owner-connected', (this.userID))
  }

  viewRecurrents(){
    this.recurrentsState = !this.recurrentsState
  }
}
