import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/helpers/navigation.service';
import { OwnerStorageService } from '../../services/storage/owner-interface-storage.service';
import { CheckInService } from '../../services/check-in/check-in.service';
import { CheckInInterfaceResponse } from 'src/app/interfaces/checkIn-interface';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { io, Socket } from 'socket.io-client'; 

@Component({
  selector: 'app-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.scss'],
})
export class IncomesComponent implements OnInit {

  @Input('readonly') readonly: boolean;
  @Input('nobuttons') nobuttons: boolean;

  private loading: boolean;
  private data: any;
  protected checkIn : CheckInInterfaceResponse[];
  protected ownerID;


  constructor(private Navigation: NavigationService, private _socketService: WebSocketService ,private _ownerStorage: OwnerStorageService, private _checkInService: CheckInService) {
    this.setLoading(true);
    this.loadData();
  }

  async ngOnInit() {
    const owner = await this._ownerStorage.getOwner()
    this.ownerID = owner.user.id
    this._checkInService.getAllCheckInTodayByOwnerID(this.ownerID).subscribe(
      res => {
      console.log(res);
      this.checkIn = res
    })

    
   }

   ionViewWillEnter(){
    this.ngOnInit()
    console.log("ivwilenterdesdecomponente")
   }

  private loadData(): void {
    setTimeout(() => {
      this.setLoading(false);
    }, 3000);
  }

  public changeAuthorization(checkIn, index){

      console.log(checkIn,index)
      this._checkInService.changeCheckInConfirmedByOwner(checkIn.id, checkIn.confirmed_by_owner).subscribe(
        res =>{
          this.checkIn[index].confirmed_by_owner = res['update']['confirmed_by_owner']
          this._socketService.notificarNuevoConfirmedByOwner(res['update'])
        } 
      )

   // this._checkInService.changeCheckInConfirmedByOwner(checkIn.id, checkIn.confirmed_by_owner).subscribe(
     // res => {
       // console.log(res);
       // this.checkIn[index].confirmed_by_owner = !checkIn.confirmed_by_owner
       // console.log("aca llamo al socket y le digo que hay un nuevo checkin autorizado")
       // this._socketService.notificarNuevoConfirmedByOwner(checkIn)
        
     // }
    //)
  }

  public getData(): any {
    return this.data;
  }

  private setData(data: any): void {
    this.data = data;
  }

  public isLoading(): boolean {
    return this.loading;
  }

  private setLoading(loading: boolean): void {
    this.loading = loading;
  }

  public isReadOnly(): boolean {
    return this.readonly;
  }

  private setReadOnly(readonly: boolean): void {
    this.readonly = readonly;
  }

  public isNobuttons(): boolean {
    return this.nobuttons;
  }

  public setNobuttons(nobuttons: boolean): void {
    this.nobuttons = nobuttons;
  }


}
