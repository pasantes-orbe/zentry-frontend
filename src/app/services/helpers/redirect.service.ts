import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {

  constructor(
    private _router: Router
  ) { }

  public redirectByRole(role: string){
    if(role == "propietario") this._router.navigate(['/home']);
    if(role == "vigilador") this._router.navigate(['/vigiladores/home']);
    if(role == "administrador") this._router.navigate(['/admin/home']);
  }
}
