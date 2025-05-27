import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Importa esto
import { ProductService } from '../../../services/product.service'; // Asegúrate de que la ruta sea correcta
import { Product } from '../../../models/product.model'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
  standalone: true,
  imports: [CommonModule] // <-- Agrega aquí
})
export class StoreComponent implements OnInit {
  products: Product[] = [];
  cart: any[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  addToCart(product: Product) {
    const found = this.cart.find((item: any) => item.id === product.id);
    if (found) {
      found.quantity += 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }
  }

  removeFromCart(product: Product) {
    this.cart = this.cart.filter(item => item.id !== product.id);
  }

  getTotal() {
    return this.cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
  }
}