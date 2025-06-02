import { Component } from '@angular/core';
import { KeycloakService } from '../services/keycloak.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartStateService } from '../services/cart-state.service'; // Importa el servicio
import { ItemCarrito } from '../models/item_carrito.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  keycloakService: any;
  username: string | undefined;
  cartCount: number = 0;

  constructor(
    private router: Router,
    private keycloak: KeycloakService,
    private cartState: CartStateService // Inyecta el servicio
  ) {}
  
  ngOnInit() {
    // Leer preferencia de tema al iniciar
    const dark = localStorage.getItem('theme') === 'dark';
    if (dark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }


    

    this.cartState.items$.subscribe(items => {
      this.cartCount = items.reduce((sum, item) => sum + item.cantidad, 0);
    });

    if (this.keycloak.isLoggedInUser()) {
      this.username = this.keycloak.getUsername();
      console.log('Usuario logueado:', this.username);
    }
  }


  toggleDarkTheme(): void {
    const isDark = document.body.classList.toggle('dark-theme');
    // Guardar preferencia en localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
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

  getUserID(): string | undefined {
    return this.keycloak.getUserId();
  }

  hasRole(role: string): boolean {
    console.log('Contiene el rol:', role, this.keycloak.hasRole(role), '!!!');
    return this.keycloak.hasRole(role);
  }

}