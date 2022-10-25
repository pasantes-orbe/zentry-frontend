import { Injectable } from '@angular/core';
import { UserInterface } from 'src/app/interfaces/user-interface';
import { AuthStorageService } from './auth-storage.service';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserStorageService {

  public user: UserInterface;

  constructor(
    private _router: Router
  ) { }

  public async saveUser(user: UserInterface) {
    this.setUser(user);

    await Preferences.set({
      key: 'USER',
      value: JSON.stringify(user)
    });

  }

  public async getUser(): Promise<UserInterface> {
    const { value } = await Preferences.get({key: 'USER'});
    return JSON.parse(value);
  }

  private setUser(user: UserInterface): void {
    this.user = user;
  }

  public async signOut(): Promise<void>{

    await Preferences.remove({key: 'JWT'});
    await Preferences.remove({key: 'USER'});

    
    this._router.navigate(["/"]);

  }


}
