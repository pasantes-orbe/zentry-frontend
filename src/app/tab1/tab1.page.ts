import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, MenuController } from '@ionic/angular';
import { UserStorageService } from '../services/storage/user-storage.service';
import { AuthStorageService } from '../services/storage/auth-storage.service';
import { UserInterface } from '../interfaces/user-interface';
import { OwnersService } from '../services/owners/owners.service';
import { OwnerInterface } from '../interfaces/owner-interface';
import { OwnerStorageService } from '../services/storage/owner-interface-storage.service';

import { OwnerResponse } from '../interfaces/ownerResponse-interface';
import { AmenitieInterface } from '../interfaces/amenitie-interface';
import { AmenitieService } from '../services/amenities/amenitie.service';
import { ReservationsInterface } from '../interfaces/reservations-interface';
import { ReservationsService } from '../services/amenities/reservations.service';
import { ReservationsComponent } from '../components/reservations/reservations.component';
import { WebSocketService } from '../services/websocket/web-socket.service';
import { AlertService } from '../services/helpers/alert.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{
  private loading: boolean;
  private user: UserInterface;
  private userID;
  protected owner: OwnerResponse;


  @ViewChild('reservationsComponent') reservationsComponent: ReservationsComponent;

  constructor(
    private menu: MenuController,
    private alertController: AlertController,
    private _userStorageService: UserStorageService,
    private _ownerStorageService: OwnerStorageService,
    private _ownersService: OwnersService,
    private _reservationsService: ReservationsService,
    private _socketService: WebSocketService,
    private alerts: AlertService
    ) { 
    this.setLoading(true);
    this.getData();

  }

  async ngOnInit() {

    const user = await this._userStorageService.getUser()

    this.userID = user.id;
    
    this._ownersService.getByID(this.userID).subscribe((owner) => {
      this.owner = owner
      this._ownerStorageService.saveOwner(owner)
    })
  }
    
  async ionViewWillEnter(){
    console.log("IVIWILL DESDE PADRE");
    await this.reservationsComponent.ngOnInit()
  }

  ionViewDidEnter() {
  }

  


  protected doRefresh(event){
    console.log(event);
  }

  private getData(){
    setTimeout(() => {
      this.setLoading(false);
    }, 3000);
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public setLoading(loading: boolean): void {
    this.loading = loading;
  }
}
