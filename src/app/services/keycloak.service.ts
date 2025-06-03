import { Injectable } from '@angular/core';
import Keycloak, { KeycloakInstance } from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class KeycloakService {
  private keycloak!: KeycloakInstance;

  init(): Promise<boolean> {
    this.keycloak = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'neuralshoes',
      clientId: 'angular_app',
    });

    return this.keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      })
      .then(authenticated => {
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

  // ✅ Método asíncrono para obtener perfil completo
  getUserInfo(): Promise<any> {
    return this.keycloak.loadUserProfile()
      .then(profile => {
        console.log('[Keycloak] User profile:', profile);
        return profile;
      })
      .catch(err => {
        console.error('[Keycloak] Error loading user profile:', err);
        throw err;
      });
  }

  // ✅ Método síncrono para obtener info básica del token
  getUserInfoSync(): any {
    if (!this.keycloak?.tokenParsed) {
      return null;
    }
    
    return {
      sub: this.keycloak.tokenParsed['sub'],
      preferred_username: this.keycloak.tokenParsed['preferred_username'],
      email: this.keycloak.tokenParsed['email'],
      name: this.keycloak.tokenParsed['name'],
      roles: this.keycloak.tokenParsed['realm_access']?.['roles'] || []
    };
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

  hasRole(role: string): boolean {
    const roles = this.getRole();
    return roles ? roles.includes(role) : false;
  }

  // ✅ Método síncrono para obtener el ID del usuario
  getUserId(): string | undefined {
    return this.keycloak?.tokenParsed?.['sub'];
  }
}