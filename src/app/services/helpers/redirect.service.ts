import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {

  constructor(
    private _router: Router
  ) { }

  public redirectByRole(role: string) {
    switch (role) {
      case 'propietario':
        this._router.navigate(['/home']); // Redirige a la página de propietario
        break;
      case 'vigilador':
        this._router.navigate(['/vigiladores/home']); // Redirige a la página de vigilador
        break;
      case 'administrador':
        this._router.navigate(['/admin/home']); // Redirige a la página de administrador
        break;
      default:
        this._router.navigate(['/menu/home']); // Redirige a una página por defecto
        break;
    }
  }
}