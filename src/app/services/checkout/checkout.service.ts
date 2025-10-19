import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Crea un checkout en el backend
   * @param checkin_id ID del check-in
   * @param details Observaciones del checkout
   * @returns Promise con la respuesta del backend
   */
  async createCheckout(checkin_id: any, details: string): Promise<any> {
    console.log('[CheckoutService] Creando checkout:', { checkin_id, details });

    const formData = new FormData();
    formData.append('id_checkin', checkin_id);
    formData.append('details', details);
    
    try {
      const response = await firstValueFrom(
        this._http.post(`${environment.URL}/api/checkout`, formData)
      );
      console.log('[CheckoutService] Checkout creado:', response);
      return response;
    } catch (error) {
      console.error('[CheckoutService] Error al crear checkout:', error);
      throw error;
    }
  }
}
