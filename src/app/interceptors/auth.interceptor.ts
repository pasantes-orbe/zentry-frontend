//src/app/interceptors/auth.interceptor.ts
import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
// Asume que tu servicio de storage se encuentra aquí:
import { AuthStorageService } from '../services/storage/auth-storage.service'; 

/**
 * Interceptor funcional para adjuntar el token JWT a las peticiones salientes.
 * Esto asegura que el Backend reciba la identidad del propietario (Ruben).
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  // 1. Inyectamos el servicio de almacenamiento de tokens
  const authStorage = inject(AuthStorageService);

  // 2. Convertimos la promesa asíncrona (getJWT) a un observable para usarla en el pipe
  return from(authStorage.getJWT()).pipe(
    switchMap(token => {
      let clonedRequest = req;

      // 3. Si el token existe, clonamos la petición y añadimos la cabecera
      if (token) {
        clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`, // Formato "Bearer [TOKEN]"
          },
        });
      }
      
      // 4. Continuamos la ejecución con la solicitud (con o sin token)
      return next(clonedRequest);
    })
  );
};