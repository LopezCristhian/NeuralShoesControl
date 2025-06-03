import { Component, OnInit, OnDestroy } from '@angular/core';
import { KeycloakService } from '../services/keycloak.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartStateService } from '../services/cart-state.service';
import { ItemCarrito } from '../models/item_carrito.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  username: string | undefined;
  cartCount: number = 0;
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private keycloak: KeycloakService,
    private cartState: CartStateService
  ) {}
  
  ngOnInit() {
    // Leer preferencia de tema al iniciar
    const dark = localStorage.getItem('theme') === 'dark';
    if (dark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    // ✅ Solo suscribirse al carrito si NO es administrador
    if (!this.hasRole('administrator')) {
      const cartSubscription = this.cartState.items$.subscribe(items => {
        this.cartCount = items.reduce((sum, item) => sum + item.cantidad, 0);
      });
      this.subscription.add(cartSubscription);
    } else {
      // ✅ Los admins no tienen carrito
      this.cartCount = 0;
    }

    if (this.keycloak.isLoggedInUser()) {
      this.username = this.keycloak.getUsername();
      console.log('Usuario logueado:', this.username);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // ✅ Método para navegar al carrito - Solo para no-admins
  goToCart() {
    if (!this.hasRole('administrator')) {
      this.router.navigate(['/cart']);
    } else {
      console.warn('Los administradores no pueden acceder al carrito');
      this.router.navigate(['/admin']); // Redirigir al panel admin
    }
  }

  toggleDarkTheme(): void {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
  
  login() {
    this.keycloak.login();
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

  getUserId(): string | undefined {
    console.log('UserId:', this.keycloak.getUserId());
    return this.keycloak.getUserId();
  }
}