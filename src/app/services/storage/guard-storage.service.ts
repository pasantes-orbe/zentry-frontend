import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { GuardResponseInterface } from 'src/app/interfaces/guard-response-interface';

@Injectable({
  providedIn: 'root'
})
export class GuardStorageService {


  constructor() { }

  public async saveGuard(guardID: any) {

    await Preferences.set({
      key: 'GUARD',
      value: guardID
    });

  }

  public async getGuard(): Promise<any>{

    const { value } = await Preferences.get({ key: 'GUARD' });
    return (value);
    
  }

  public async remove(): Promise<void>{
    await Preferences.remove({key: 'GUARD'});
  }


}
