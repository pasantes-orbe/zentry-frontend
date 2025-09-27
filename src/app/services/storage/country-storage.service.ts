//src/app/services/storage/country-storage.service.ts
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { CountryInteface } from '../../interfaces/country-interface';

@Injectable({
  providedIn: 'root'
})
export class CountryStorageService {
  private readonly COUNTRY_KEY = 'COUNTRY';

  constructor() {}

  public async saveCountry(country: CountryInteface): Promise<void> {
    try {
      await Preferences.set({
        key: this.COUNTRY_KEY,
        value: JSON.stringify(country)
      });
      console.log('Datos del país guardados correctamente.');
    } catch (error) {
      console.error('Error al guardar los datos del país:', error);
    }
  }

  public async getCountry(): Promise<CountryInteface | null> {
    try {
      const { value } = await Preferences.get({ key: this.COUNTRY_KEY });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error al obtener los datos del país:', error);
      return null;
    }
  }

  public async hasCountry(): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: this.COUNTRY_KEY });
      return !!value;
    } catch (error) {
      console.error('Error al verificar si existe un país:', error);
      return false;
    }
  }

  public async clearCountry(): Promise<void> {
    try {
      await Preferences.remove({ key: this.COUNTRY_KEY });
      console.log('Datos del país eliminados correctamente.');
    } catch (error) {
      console.error('Error al eliminar los datos del país:', error);
    }
  }

  public async signOut(): Promise<void> {
    await this.clearCountry();
  }
}