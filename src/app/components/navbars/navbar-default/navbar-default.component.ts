import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { UserInterface } from 'src/app/interfaces/user-interface';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';

@Component({
  selector: 'app-navbar-default',
  templateUrl: './navbar-default.component.html',
  styleUrls: ['./navbar-default.component.scss'],
})
export class NavbarDefaultComponent implements OnInit {

  protected user: UserInterface;

  constructor(
    private menu: MenuController,
    private router: Router,
    private _userStorage: UserStorageService
  ) { }

  async ngOnInit() {
    this.setUser(await this._userStorage.getUser());
    //TODO:
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

  protected signOut(): void {
    this._userStorage.signOut();
    this.router.navigate(["/"]);
  }


  public getUser(): UserInterface {
    return this.user;
  }

  private setUser(user: UserInterface): void {
    this.user = user;
  }




}
