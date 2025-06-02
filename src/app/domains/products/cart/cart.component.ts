import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartStateService } from '../../../services/cart-state.service';
import { ItemCarrito } from '../../../models/item_carrito.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  items: ItemCarrito[] = [];

  constructor(private cartState: CartStateService) {}

  ngOnInit(): void {
    this.cartState.items$.subscribe(items => {
      this.items = items;
    });
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  }
}