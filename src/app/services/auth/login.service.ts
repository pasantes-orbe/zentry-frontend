// src/app/services/auth/login.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthStorageService } from '../storage/auth-storage.service';

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(private http: HttpClient, private _authStorage: AuthStorageService) {}

  /** Login normal */
  public login(data: { email: string; password: string }) {
    return this.http.post<{ token: string; role?: string }>(`${environment.URL}/api/auth/login`, data);
  }

  /** Valida JWT contra backend. Devuelve true/false; jamás fuerza sesión. */
  public async validJWT(): Promise<boolean> {
    const token = await this._authStorage.getJWT();
    if (!token) return false;

    try {
      const resp = await fetch(`${environment.URL}/api/auth/jwt`, {
        method: 'GET',
        headers: { 'Content-Type': 'text/plain', Authorization: `Bearer ${token}` },
      });
      return resp.status === 200;
    } catch {
      return false;
    }
  }

  /** Chequea rol en backend (opcional para route guards) */
  public async isRole(roleSearch: string): Promise<boolean> {
    const token = await this._authStorage.getJWT();
    if (!token) return false;

    try {
      const resp = await fetch(`${environment.URL}/api/auth/jwt/${roleSearch}`, {
        method: 'GET', //Cualquier cosa cambiar a POST -> back -> auth.routes.ts
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });

      // 1. Si no es 200 (ej. 401 por token inválido), denegamos.
      if (resp.status !== 200) {
        return false;
      }
       // 2. CORRECCIÓN CLAVE: Leemos el cuerpo JSON que es el booleano ('true' o 'false')
      const isRoleValid = await resp.json(); 

      // 3. Retornamos el valor del cuerpo. Esto detiene el acceso cruzado.
      return isRoleValid === true; 

    } catch {
      // Falla si hay error de red o de parseo JSON.
      return false;
    }
  }
}