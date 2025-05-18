import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index',
  standalone: true,
  templateUrl: './index.component.html'
})
export class IndexComponent {
  constructor(private router: Router) {}

  goToProducts() {
    this.router.navigate(['/productos']);
  }
  goToCategories() {
  this.router.navigate(['/categorias']);
}
  goToBrands() {
    this.router.navigate(['/marcas']);
  }
  goToAdminDemo() {
    this.router.navigate(['/admin-demo']);
  }
}