import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';

// Servicios
import { UserStorageService } from '../services/storage/user-storage.service';
import { OwnerStorageService } from '../services/storage/owner-interface-storage.service';
import { OwnersService } from '../services/owners/owners.service';
import { OwnerResponse } from '../interfaces/ownerResponse-interface';

// Componentes
import { ReservationsComponent } from '../components/reservations/reservations.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReservationsComponent
  ]
})
export class Tab1Page implements OnInit {
  private loading: boolean = true;
  private userID: any;
  protected owner: OwnerResponse | null = null;

  @ViewChild('reservationsComponent') reservationsComponent!: ReservationsComponent;

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
    try {
      const user = await this._userStorageService.getUser();
      if (user) {
        this.userID = user.id;
        this._ownersService.getByID(this.userID).subscribe({
          next: (owner) => {
            this.owner = owner;
            this._ownerStorageService.saveOwner(owner);
          },
          error: (error) => {
            console.error('Error loading owner:', error);
            this.owner = null;
          }
        });
      }
    } catch (error) {
      console.error('Error in ngOnInit:', error);
      this.owner = null;
    }
  }

  async ionViewWillEnter() {
    if (this.reservationsComponent) {
      // await this.reservationsComponent.ngOnInit();
    }
  }

  protected doRefresh(event: any) {
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
