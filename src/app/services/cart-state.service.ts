import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ItemCarrito } from '../models/item_carrito.model';

@Injectable({ providedIn: 'root' })
export class CartStateService {
  private itemsSubject = new BehaviorSubject<ItemCarrito[]>([]);
  items$ = this.itemsSubject.asObservable();

  setItems(items: ItemCarrito[]) {
    this.itemsSubject.next(items);
  }

  clear() {
    this.itemsSubject.next([]);
  }

  getItemsSnapshot(): ItemCarrito[] {
    return this.itemsSubject.value;
  }
}