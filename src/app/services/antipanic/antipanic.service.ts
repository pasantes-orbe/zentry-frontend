import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { OwnerStorageService } from '../storage/owner-interface-storage.service';
import { UserStorageService } from '../storage/user-storage.service';
import { WebSocketService } from '../websocket/web-socket.service';

@Injectable({
  providedIn: 'root'
})
export class AntipanicService {

  constructor(
    private _ownerStorage: OwnerStorageService,
    private _userStorage: UserStorageService,
    private _http: HttpClient,
    private _socketService: WebSocketService
  ) { }

  activateAntipanic(ownerID: string, ownerAddress: string, countryID: string, propertyNumber: string): Observable<any> {
    const formData = new FormData();

    console.log('Activando antipánico:', { ownerID, ownerAddress, countryID, propertyNumber });
    
    formData.append('id_owner', ownerID);
    formData.append('address', ownerAddress);
    formData.append('id_country', countryID);
    formData.append('propertyNumber', propertyNumber);

    return this._http.post(`${environment.URL}/api/antipanic`, formData);
  }

  desactivateAntipanic(id: string): Observable<any> {
    console.log('Desactivando antipánico:', id);
    return this._http.patch(`${environment.URL}/api/antipanic/${id}`, {});
  }

  // Cambié el tipo de parámetro para aceptar tanto string como number
  getAllAntipanicByCountry(id_country: string | number): Observable<any[]> {
    return this._http.get<any[]>(`${environment.URL}/api/antipanic/${id_country}`);
  }

  // Método adicional para obtener el estado de una alerta específica
  getAntipanicStatus(id: string): Observable<any> {
    return this._http.get(`${environment.URL}/api/antipanic/status/${id}`);
  }

  // Método para obtener todas las alertas activas de un propietario
  getActiveAlertsByOwner(ownerId: string | number): Observable<any[]> {
    return this._http.get<any[]>(`${environment.URL}/api/antipanic/owner/${ownerId}/active`);
  }
}