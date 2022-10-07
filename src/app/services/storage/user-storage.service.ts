import { Injectable } from '@angular/core';
import { UserInterface } from 'src/app/interfaces/user-interface';
import { AuthStorageService } from './auth-storage.service';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class UserStorageService {

  public user: UserInterface;

  constructor(
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




}
