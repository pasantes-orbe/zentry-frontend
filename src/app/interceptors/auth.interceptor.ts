// src/app/interceptors/auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthStorageService } from '../services/storage/auth-storage.service';
import {  } from 'src/environments/environment';
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const auth = inject(AuthStorageService);
  const token = auth.getTokenSync(); // <-- sin await

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
    console.log('JWT?', !!token, req.url);

  return next(authReq);
};
