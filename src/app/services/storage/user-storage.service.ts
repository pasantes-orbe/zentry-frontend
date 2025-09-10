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

  private async init(): Promise<void> {
    try {
      const storage = await this.storage.create();
      this._storage = storage;
      console.log('Almacenamiento inicializado correctamente.');
    } catch (error) {
      console.error('Error al inicializar el almacenamiento:', error);
    }
  }

  public async saveUser(user: UserInterface): Promise<void> {
    try {
      await this._storage?.set('user', user);
      console.log('Usuario guardado correctamente.');
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
    }
  }

  public async getUser(): Promise<UserInterface | null> {
    try {
      const user = await this._storage?.get('user');
      console.log('Usuario obtenido:', user);
      return user || null;
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
      return null;
    }
  }

  public async hasUser(): Promise<boolean> {
    try {
      const user = await this._storage?.get('user');
      return !!user;
    } catch (error) {
      console.error('Error al verificar si existe un usuario:', error);
      return false;
    }
  }

  public async clearUser(): Promise<void> {
    try {
      await this._storage?.remove('user');
      console.log('Usuario eliminado correctamente.');
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
    }
  }

  public async signOut(): Promise<void> {
    await this.clearUser();
  }
}