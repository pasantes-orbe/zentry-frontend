import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { UserInterface } from 'src/app/interfaces/user-interface';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { OwnerStorageService } from '../../../services/storage/owner-interface-storage.service';

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
    protected _userStorage: UserStorageService,
    protected _ownerStorage: OwnerStorageService
  ) { }

  async ngOnInit() {

    this.setUser(await this._userStorage.getUser());

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
