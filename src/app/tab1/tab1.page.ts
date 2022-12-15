import { Component, OnInit } from '@angular/core';
import { AlertController, MenuController } from '@ionic/angular';
import { UserStorageService } from '../services/storage/user-storage.service';
import { AuthStorageService } from '../services/storage/auth-storage.service';
import { UserInterface } from '../interfaces/user-interface';
import { OwnersService } from '../services/owners/owners.service';
import { OwnerInterface } from '../interfaces/owner-interface';
import { OwnerStorageService } from '../services/storage/owner-interface-storage.service';
import swal from'sweetalert2';
import { OwnerResponse } from '../interfaces/ownerResponse-interface';
import { AmenitieInterface } from '../interfaces/amenitie-interface';
import { AmenitieService } from '../services/amenities/amenitie.service';
import { ReservationsInterface } from '../interfaces/reservations-interface';
import { ReservationsService } from '../services/amenities/reservations.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{
  private loading: boolean;
  private user: UserInterface;
  private userID;
  protected owner: OwnerResponse
  protected reservations: ReservationsInterface[]


  constructor(
    private menu: MenuController,
    private alertController: AlertController,
    private _userStorageService: UserStorageService,
    private _ownerStorageService: OwnerStorageService,
    private _ownersService: OwnersService,
    private _reservationsService: ReservationsService
    ) { 
    this.setLoading(true);
    this.getData();

    
    this.presentAlert();  

  }

  async ngOnInit() {
    console.log("ONINIT")
    const user = await this._userStorageService.getUser()
    this.userID = user.id;
    this._ownersService.getByID(this.userID).subscribe((owner) => {
      this.owner = owner
      this._ownerStorageService.saveOwner(owner)
    })

    this._reservationsService.getAllByUser().then(data => data.subscribe(reservations => this.reservations = reservations ))
  }
    
  public async ionViewWillEnter(){

    console.log("IONWENTER")

    await this.ngOnInit() 
  }
  async presentAlert(){
    const alert = await this.alertController.create({
      header: 'Solicitud de Ingreso',
      message: 'Chicala, Alejandro <br> Ingreso 22/08/2019 Hora 10:23 <br> Salida 22/08/2019 Hora 18:00',
      backdropDismiss: false,
      buttons: [        
        {
          text: 'Autorizar',
          role: 'confirm',
          handler: () => {
            console.log("Autorizado");
            this.presentAlert2();
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log("Cancelled");
            this.presentAlert2();
          },
        }
      ],
    });

    await alert.present();
    
  }

  async presentAlert2(){
    const alert = await this.alertController.create({
      header: 'Reservas',
      message: 'Estado: Confirmado <br> Evento: "Casamiento Juan" <br> Fecha 22/08/2019 Hora 18:00',
      backdropDismiss: false,
      buttons: [        
        {
          text: 'Ok',
          role: 'confirm',
        }
      ],
    });

    await alert.present();
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
