import { provideKeycloak } from 'keycloak-angular';
import { provideRouter } from '@angular/router';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { routes } from './app.routes';
import { environment } from './environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloak({
      config: {
        url: `${environment.apiBaseUrl}`,
        realm: 'neuralshoes',
        clientId: 'angular_app',
      },
      initOptions: {
        onLoad: 'check-sso', // Solo revisa si ya hay sesión activa
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
        pkceMethod: 'S256',
      },
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
  ],
};
