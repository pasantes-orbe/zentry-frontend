
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
// CAMBIO: Se importa IonicStorageModule para usarlo con importProvidersFrom.
import { IonicStorageModule } from '@ionic/storage-angular';

// CAMBIO: Se corrige la ruta para que coincida con tu estructura de carpetas.
import { routes } from './app/routes/routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // CAMBIO: Esta es la forma correcta de proveer los servicios de Ionic y Storage en una app standalone.
    importProvidersFrom(IonicModule.forRoot({})),
    importProvidersFrom(IonicStorageModule.forRoot()),
    provideRouter(routes),
  ],
});
