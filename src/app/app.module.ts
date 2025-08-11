// src/app/app.module.ts

import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
// CAMBIO CLAVE: Se importa 'Storage' y 'provideStorage'.
import { Storage, provideStorage } from '@ionic/storage-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import localeEsAr from '@angular/common/locales/es-AR';

registerLocaleData(localeEsAr, 'es-Ar');

@NgModule({ declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
            registrationStrategy: 'registerWhenStable:30000'
        })], providers: [
        { provide: LOCALE_ID, useValue: 'es-Ar' },
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        // CAMBIO CLAVE: Se utiliza 'useFactory' para asegurar la correcta inicialización del servicio.
        { provide: Storage, useFactory: () => provideStorage({}) },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule {}
