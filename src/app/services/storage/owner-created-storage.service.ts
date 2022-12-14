// import { Injectable } from '@angular/core';
// import { Preferences } from '@capacitor/preferences';

// @Injectable({
//   providedIn: 'root'
// })
// export class OwnerStorageService {

//   constructor(
//   ) { }

//   public async saveCountryID (ownerID): Promise<void>{
//     await Preferences.set({
//       key: 'ownerID',
//       value: ownerID
//     });
//   }

//   public async getCountryID(): Promise<string>{
//     const { value } = await Preferences.get({ key: 'ownerID' });
//     return JSON.parse(value);
    
//   }
// }

