import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { OwnerInterface } from '../../interfaces/owner-interface';

@Injectable({
  providedIn: 'root'
})
export class OwnerStorageService {

public owner: OwnerInterface;

  constructor(
    private _router: Router
  ) { }

  public async saveOwner (owner: OwnerInterface): Promise<void>{
    this.setOwner(owner);
    await Preferences.set({
      key: 'OWNER',
      value: JSON.stringify(owner)
    });
  }

  public async getCountryID(): Promise<OwnerInterface>{
    const { value } = await Preferences.get({ key: 'OWNER' });
    return JSON.parse(value);
    
  }
  private setOwner(owner: OwnerInterface): void {
    this.owner = owner;
  }
  
  public async signOut(): Promise<void>{

    await Preferences.remove({key: 'OWNER'});

    
    this._router.navigate(["/"]);

  }

}

