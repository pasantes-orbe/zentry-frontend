import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { CountryInteface } from '../../interfaces/country-interface';

@Injectable({
  providedIn: 'root'
})
export class CountryStorageService {

  constructor(
  ) { }
  public country: CountryInteface;

  public async saveCountry (country: CountryInteface): Promise<void>{
    this.setCountry(country);

    await Preferences.set({
      key: 'COUNTRY',
      value: JSON.stringify(country)
    });
  }

  public async getCountry(): Promise<CountryInteface>{
    const { value } = await Preferences.get({ key: 'COUNTRY' });
    return JSON.parse(value);
    
  }

  private setCountry(country: CountryInteface): void {
    this.country = country;
  }

  public async signOut(): Promise<void>{

    await Preferences.remove({key: 'COUNTRY'});
  }

}

