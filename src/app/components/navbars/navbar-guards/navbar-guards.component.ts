import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { NavigationService } from 'src/app/helpers/navigation.service';
import { UserInterface } from 'src/app/interfaces/user-interface';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { IntervalStorageService } from 'src/app/services/storage/interval-storage.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';

@Component({
  selector: 'app-navbar-guards',
  templateUrl: './navbar-guards.component.html',
  styleUrls: ['./navbar-guards.component.scss'],
})
export class NavbarGuardsComponent implements OnInit {

  protected user: UserInterface;
  public countryName: string = "";
  
  constructor(
    private router: Router,
    protected _userStorage: UserStorageService,
    private menu: MenuController,
    private _socketService: WebSocketService,
    protected _countryStorage: CountryStorageService,
    protected _intervalStorageService: IntervalStorageService
    ) { }

  async ngOnInit() {
    const country = await this._countryStorage.getCountry()
    this.countryName = country.name
    console.log(country.name)
    this.setUser(await this._userStorage.getUser());
  }

  ionViewWillEnter(){

  }

  async signOut(){
    const user = this.getUser()
    const timerID = await this._intervalStorageService.getInterval_id()
    await this._intervalStorageService.remove()
    console.log(timerID)
    console.log(window);
    console.log(window.clearInterval);
    window.clearInterval(timerID);
    this._socketService.disconnectGuardUbication(user.id)
    this._userStorage.signOut()
    this._countryStorage.signOut() 
  }

  protected navigate(url: string): void {
    this.router.navigate([url]);
  }

  protected openEnd(): void {
    this.menu.open('end');
  }

  protected openCustom(): void {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }


  protected openFirst(id: string): void {
    this.menu.enable(true, id);
    this.menu.open(id);
  }

  public getUser(): UserInterface {
    return this.user;
  }

  private setUser(user: UserInterface): void {
    this.user = user;
  }


}
