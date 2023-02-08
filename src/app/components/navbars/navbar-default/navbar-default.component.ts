import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { UserInterface } from 'src/app/interfaces/user-interface';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { OwnerStorageService } from '../../../services/storage/owner-interface-storage.service';

@Component({
  selector: 'app-navbar-default',
  templateUrl: './navbar-default.component.html',
  styleUrls: ['./navbar-default.component.scss'],
})
export class NavbarDefaultComponent implements OnInit {

  protected user: UserInterface;
  protected id_user;
  public dropdownState: boolean = false;
  
  public notifications;

  constructor(
    private menu: MenuController,
    private router: Router,
    protected _notificationService: NotificationsService,
    protected _userStorage: UserStorageService,
    protected _ownerStorage: OwnerStorageService
  ) { }

  async ngOnInit() {

    this.setUser(await this._userStorage.getUser());
    this.id_user = await (await this._userStorage.getUser()).id


    this._notificationService.getAllByUser(this.id_user).subscribe(
      res => {
        console.log(res);
        console.log("SE EJECUTA ESTO TAMBIEN");

        console.log(res.slice((res.length - 5), (res.length)));

        // this.notifications = res
          this.notifications = res.slice((res.length - 5), (res.length))

       }
      )

  }
 

  protected navigate(url: string): void {
    this.router.navigate([url]);
  }

  protected openFirst(id: string): void {
    this.menu.enable(true, id);
    this.menu.open(id);
  }

  protected openEnd(): void {
    this.menu.open('end');
  }

  protected openCustom(): void {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }

  public getUser(): UserInterface {
    return this.user;
  }

  private setUser(user: UserInterface): void {
    this.user = user;
  }
  public deleteNotification(noti, i){
    console.log("Eliminado", noti, i);
    this.notifications.splice(i,1)
  }

  public openNotifications(){
    this.dropdownState = !this.dropdownState
  }




}
