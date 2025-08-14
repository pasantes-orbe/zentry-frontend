import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { UserInterface } from 'src/app/interfaces/user-interface';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';

@Component({
    selector: 'app-navbar-admin',
    templateUrl: './navbar-admin.component.html',
    styleUrls: ['./navbar-admin.component.scss'],
    standalone: true,
})
export class NavbarAdminComponent implements OnInit {

  protected user: UserInterface;
  protected countryName: string = "";

  constructor(
    private menu: MenuController,
    private router: Router,
    protected _userStorage: UserStorageService,
    protected _countryStorage: CountryStorageService
  ) { }

  async ngOnInit() {
    this.countryName =  await (await this._countryStorage.getCountry()).name;

    this.setUser(await this._userStorage.getUser());
    console.log("A", await this._userStorage.getUser());


    
  }

  protected signOut(){
    this._userStorage.signOut()
    this._countryStorage.signOut()
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

}
