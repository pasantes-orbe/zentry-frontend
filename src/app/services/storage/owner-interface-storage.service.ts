// src/app/services/storage/owner-interface-storage.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { OwnerResponse } from 'src/app/interfaces/ownerResponse-interface';
import { OwnerInterface } from '../../interfaces/owner-interface'; //VER SI ACA NO ES EL PROBLEMA SINO COMENTARLO NOMAS

@Injectable({
  providedIn: 'root'
})
export class OwnerStorageService {

public owner: OwnerResponse;

  constructor(
    private _router: Router
  ) { }

  public async saveOwner (owner: OwnerResponse): Promise<void>{
    this.setOwner(owner);
    await Preferences.set({
      key: 'OWNER',
      value: JSON.stringify(owner)
    });
  }

  public async getOwner(): Promise<OwnerResponse>{
    const { value } = await Preferences.get({ key: 'OWNER' });
//VER SI ACA NO ES EL PROBLEMA SINO COMENTARLO NOMAS o borrarlo 
    if (value) {
        return JSON.parse(value);
        } else {
      return null; // Devuelve 'null' de forma segura si no hay datos.
    }   
  }

  private setOwner(owner: OwnerResponse): void {
    this.owner = owner;
  }
  
  public async signOut(): Promise<void>{

    await Preferences.remove({key: 'OWNER'});

    
    this._router.navigate(["/"]);

  }
}