// src/app/services/storage/auth-storage.service.ts
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class AuthStorageService {
  private readonly JWT_KEY = 'JWT';
  private inMemoryToken: string | null = null;

  async init(): Promise<void> {
    const { value } = await Preferences.get({ key: this.JWT_KEY });
    this.inMemoryToken = value ?? null;
  }

  getTokenSync(): string | null {
    return this.inMemoryToken; // <-- lectura sin await para el interceptor
  }

  async saveJWT(jwt: string): Promise<void> {
    await Preferences.set({ key: this.JWT_KEY, value: jwt });
    this.inMemoryToken = jwt;  // <-- mantener copia en memoria
  }

  async getJWT(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.JWT_KEY });
    this.inMemoryToken = value ?? null;
    return this.inMemoryToken;
  }

  async clearJWT(): Promise<void> {
    await Preferences.remove({ key: this.JWT_KEY });
    this.inMemoryToken = null;
  }
}
