import { Injectable } from '@angular/core';
import { UserInterface } from 'src/app/interfaces/user-interface';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class UserStorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  public async saveUser(user: UserInterface): Promise<void> {
    await this._storage?.set('user', user);
  }

  public async getUser(): Promise<UserInterface | null> {
    return await this._storage?.get('user');
  }

  public async signOut(): Promise<void> {
    await this._storage?.remove('user');
    // Redirect to login or handle sign out logic
  }

  public async removeUser(): Promise<void> {
    await this._storage?.remove('user');
  }
}