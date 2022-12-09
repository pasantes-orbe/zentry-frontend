import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class CountryStorageService {

  constructor(
  ) { }

  public async saveCountryID (countryID): Promise<void>{
    await Preferences.set({
      key: 'countryID',
      value: countryID
    });
  }

  public async getCountryID(): Promise<string>{
    const { value } = await Preferences.get({ key: 'countryID' });
    return JSON.parse(value);
    
  }
}

