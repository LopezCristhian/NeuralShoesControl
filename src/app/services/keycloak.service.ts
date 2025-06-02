// src/app/services/keycloak.service.ts
import { Injectable } from '@angular/core';
import Keycloak, { KeycloakInstance } from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class KeycloakService {
  static isLoggedInUser(): boolean {
    throw new Error('Method not implemented.');
  }
  private keycloak!: KeycloakInstance;

  init(): Promise<boolean> {
    this.keycloak = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'neuralshoes',
      clientId: 'angular_app',
    });

    return this.keycloak
      .init({
        onLoad: 'check-sso', // No redirige automáticamente al login
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
        pkceMethod: 'S256',
        checkLoginIframe: false, // Puedes ponerlo en false temporalmente
      })
      .then(authenticated => {
        console.log('[Keycloak] Authenticated:', authenticated);
        console.log('[Keycloak] Authenticated:', authenticated);
        console.log('[Keycloak] Token:', this.keycloak.token);
        return authenticated;
      })
      .catch(err => {
        console.error('[Keycloak] Initialization error:', err);
        return false;
      });
  }

  login() {
    this.keycloak.login();
  }

  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  getToken(): string | undefined {
    return this.keycloak?.token;
  }

  getUsername(): string | undefined {
    return this.keycloak?.tokenParsed?.['preferred_username'];
  }

  isLoggedInUser(): boolean {
    return this.keycloak?.authenticated ?? false;
  }


  isLoggedIn(): boolean {
    return !!this.keycloak?.token;
  }

  getRole(): string[] | undefined {
    return this.keycloak?.tokenParsed?.['realm_access']?.['roles'];
  }

  getRoles(): string[] {
  return this.keycloak?.realmAccess?.roles ?? [];
  }

  // Función para verificar si la lista de roles contiene un rol específico
  hasRole(role: string): boolean {
    const roles = this.getRole();
    return roles ? roles.includes(role) : false;
  }

  // Función que trea el id del usuario autenticado
  getUserId(): string | undefined {
    return this.keycloak?.tokenParsed?.['sub'];
  }

}
