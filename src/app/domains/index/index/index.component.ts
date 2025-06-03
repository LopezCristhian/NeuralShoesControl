import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { KeycloakService } from '../../../services/keycloak.service';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './index.component.html'
})
export class IndexComponent {
  constructor(private router: Router, private keycloak: KeycloakService) {}

  // usuario autenticado
  isLoggedIn(): boolean {
    return this.keycloak.isLoggedInUser();
  }

    /** 
   * Función que inicializa en tienda si un usuario cualguiera no esta logueado 
   */
  ngOnInit() {
    if (!this.keycloak.isLoggedIn()) {
      this.router.navigate(['/tienda']);
    }else if (this.keycloak.isLoggedInUser() && this.keycloak.hasRole('administrator')) {
      this.router.navigate(['/administracion']);  
    }else {
      this.router.navigate(['/tienda']);
    }
      
  }

  goToProducts() {
    this.router.navigate(['/productos']);
  }
  
  goToCategories() {
  this.router.navigate(['/categorias']);
 }

  goToBrands() {
    this.router.navigate(['/marcas']);
  }
  goToStore() {
    this.router.navigate(['/tienda']);
  }

  hasRole(role: string): boolean {
    console.log('Contiene el rol:', role, this.keycloak.hasRole(role), '!!!');
    return this.keycloak.hasRole(role);
  }
  
}