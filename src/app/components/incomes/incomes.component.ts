import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/helpers/navigation.service';
import { OwnerStorageService } from '../../services/storage/owner-interface-storage.service';
import { CheckInService } from '../../services/check-in/check-in.service';
import { CheckInInterfaceResponse } from 'src/app/interfaces/checkIn-interface';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';

@Component({
  selector: 'app-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.scss'],
})
export class IncomesComponent implements OnInit {

  @Input('readonly') readonly: boolean = false;
  @Input('nobuttons') nobuttons: boolean = false;

  public loading: boolean = true;
  
  // CORRECCIÓN 1: Se cambian las propiedades a 'public' y se inicializan.
  public checkIn: CheckInInterfaceResponse[] = [];
  public ownerID: number;

  // CORRECCIÓN 2: Se cambia 'Navigation' a 'public'.
  // Las propiedades usadas en el HTML deben ser públicas.
  constructor(
    public Navigation: NavigationService, 
    public _socketService: WebSocketService,
    public _ownerStorage: OwnerStorageService,
    public _checkInService: CheckInService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
    console.log("ionViewWillEnter desde incomes.component");
  }

  public async loadData(): Promise<void> {
    this.setLoading(true);
    try {
      const owner = await this._ownerStorage.getOwner();
      if (owner && owner.user) {
        this.ownerID = owner.user.id;
        this._checkInService.getAllCheckInTodayByOwnerID(this.ownerID).subscribe(
          res => {
            console.log(res);
            this.checkIn = res;
            this.setLoading(false);
          },
          err => {
            console.error(err);
            this.setLoading(false);
          }
        );
      } else {
        this.setLoading(false);
      }
    } catch (error) {
      console.error(error);
      this.setLoading(false);
    }
  }

  public changeAuthorization(checkIn: CheckInInterfaceResponse, index: number) {
    console.log(checkIn, index);
    this._checkInService.changeCheckInConfirmedByOwner(checkIn.id, !checkIn.confirmed_by_owner).subscribe(
      res => {
        if (res && res['update']) {
          this.checkIn[index].confirmed_by_owner = res['update']['confirmed_by_owner'];
          this._socketService.notificarNuevoConfirmedByOwner(res['update']);
        }
      }
    );
  }

  public setLoading(loading: boolean): void {
    this.loading = loading;
  }

  public isLoading(): boolean {
    return this.loading;
  }
}
