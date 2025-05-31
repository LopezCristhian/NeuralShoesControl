import { Component } from '@angular/core';
import { KeycloakService } from '../services/keycloak.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule], // <- Esto importa *ngIf y otros
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
keycloakService: any;
  username: string | undefined;

  constructor(private router: Router, private keycloak: KeycloakService) { }
  
  ngOnInit() {
    if (this.keycloak.isLoggedInUser()) {
      this.username = this.keycloak.getUsername();
      console.log('Usuario logueado:', this.username);
    }
  }
  
  login() {
    this.keycloak.login();
    //console.log('Login button clicked');
  }

  logout() {
    this.keycloak.logout();
  }

  isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn() as boolean;
  }

  isLoggedInUser(): boolean {
    return this.keycloak.isLoggedInUser();
  }

  getUsername(): string | undefined {
    return this.keycloak.getUsername();
  }

  getRoleUser(): string[] | undefined {
    console.log('Roles:', this.keycloak.getRole());
    return this.keycloak.getRole();
  }

  hasRole(role: string): boolean {
    console.log('Contiene el rol:', role, this.keycloak.hasRole(role), '!!!');
    return this.keycloak.hasRole(role);
  }

}