import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {

  constructor(private _router: Router) {}

  public redirectByRole(role: string) {
    switch (role) {
      case 'propietario':
        this._router.navigate(['/home']); // OK
        break;

      case 'vigilador':
        // ❌ No existe '/vigiladores/home'
        // this._router.navigate(['/vigiladores/home']);
        // ✅ Ruta correcta según routes.ts
        this._router.navigate(['/guards/home']);
        break;

      case 'administrador':
        this._router.navigate(['/admin/home']); // OK
        break;

      default:
        // ❌ No existe '/menu/home'
        // this._router.navigate(['/menu/home']);
        // ✅ Fallback realista
        this._router.navigate(['/login']);
        break;
    }
  }
}
