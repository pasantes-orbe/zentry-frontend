// src/app/services/storage/auth-storage.service.ts
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class AuthStorageService {

  private readonly JWT_KEY = 'JWT'; // Clave para almacenar el token JWT
  private readonly TOKEN_JWT_ADMIN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIyIiwiaWF0IjoxNzU4OTEwNDYwLCJleHAiOjE3NTk1MTUyNjB9.KcUPdY-qO5O3BuGBObOl1UDpFd9r8YPgcXYVYF87tdY'; // Token JWT de admin BD

  constructor() { }

  // Guardar el token JWT
  public async saveJWT(jwt: string): Promise<void> {
    try {
      await Preferences.set({
        key: this.JWT_KEY,
        //value: JSON.stringify(jwt)
        value: jwt
      });
      console.log('Token JWT guardado correctamente.');
    } catch (error) {
      console.error('Error al guardar el token JWT:', error);
    }
  }

  // Obtener el token JWT
  public async getJWT(): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key: this.JWT_KEY });
      
      // ========================================================
      // INYECCIÓN DE TOKEN DE PRUEBA
      if (!value) {
        console.warn("ALERTA: Token JWT forzado para pruebas.");
        await Preferences.set({ key: this.JWT_KEY, value: JSON.stringify(this.TOKEN_JWT_ADMIN) });
        return this.TOKEN_JWT_ADMIN; 
      }
      // ========================================================
      //return value ? JSON.parse(value) : null;
      return value || null;
    } catch (error) {
      console.error('Error al obtener el token JWT:', error);
      return null;
    }
  }

  // Limpiar el token JWT
  public async clearJWT(): Promise<void> {
    try {
      await Preferences.remove({ key: this.JWT_KEY });
      console.log('Token JWT eliminado correctamente.');
    } catch (error) {
      console.error('Error al eliminar el token JWT:', error);
    }
  }

  // Verificar si existe un token JWT
  public async hasJWT(): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: this.JWT_KEY });
      return !!value; // Devuelve true si hay un valor, false si no
    } catch (error) {
      console.error('Error al verificar la existencia del token JWT:', error);
      return false;
    }
  }
}