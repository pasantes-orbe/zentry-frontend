import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuController } from '@ionic/angular';

// Componentes Standalone de Ionic
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';

// CORRECCIÓN: Rutas de importación ajustadas a la estructura de tu proyecto
import { UserStorageService } from '../../../services/storage/user-storage.service';
import { OwnerStorageService } from '../../../services/storage/owner-interface-storage.service';
import { OwnersService } from '../../../services/owners/owners.service';
import { OwnerResponse } from '../../../interfaces/ownerResponse-interface';
import { HeaderComponent } from '../../../components/header/header.component';
import { ReservationsComponent } from '../../../components/reservations/reservations.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonRefresher, IonRefresherContent,
    HeaderComponent,
    // NOTA: Para que esto funcione, 'ReservationsComponent' también debe ser convertido a standalone.
    ReservationsComponent
  ]
})
export class Tab1Page implements OnInit {
  private loading: boolean;
  private userID;
  protected owner: OwnerResponse;

  @ViewChild('reservationsComponent') reservationsComponent: ReservationsComponent;

  constructor(
    private menu: MenuController,
    private _userStorageService: UserStorageService,
    private _ownerStorageService: OwnerStorageService,
    private _ownersService: OwnersService
  ) {
    this.setLoading(true);
    this.getData();
  }

  async ngOnInit() {
    const user = await this._userStorageService.getUser();
    this.userID = user.id;
    this._ownersService.getByID(this.userID).subscribe((owner) => {
      this.owner = owner;
      this._ownerStorageService.saveOwner(owner);
    });
  }

  async ionViewWillEnter() {
    // Necesitamos convertir ReservationsComponent a standalone también
    if (this.reservationsComponent) {
      // await this.reservationsComponent.ngOnInit();
    }
  }

  protected doRefresh(event) {
    console.log(event);
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  private getData() {
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
