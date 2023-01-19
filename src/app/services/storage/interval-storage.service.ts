import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class IntervalStorageService {

  constructor(
  ) { }

  public async saveInterval_id(id: string): Promise<void>{
    await Preferences.set({
      key: 'INTERVAL_ID',
      value: id
    });
  }

  public async getInterval_id(): Promise<number>{

    const { value } = await Preferences.get({ key: 'INTERVAL_ID' });
    const id_number = Number(value)
    return (id_number);
    
  }

  
}
