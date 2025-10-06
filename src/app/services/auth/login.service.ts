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
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', Authorization: token },
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
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', Authorization: token },
      });
      return resp.status === 200;
    } catch {
      return false;
    }
  }
}
