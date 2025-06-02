import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemCarrito, ItemCarritoCreate } from '../models/item_carrito.model';

@Injectable({ providedIn: 'root' })
export class ItemCartService {
  private apiUrl = 'http://localhost:8000/api/carrito-items/';

  constructor(private http: HttpClient) {}

  getItems(): Observable<ItemCarrito[]> {
    return this.http.get<ItemCarrito[]>(this.apiUrl);
  }

  getItemById(itemId: string): Observable<ItemCarrito> {
    return this.http.get<ItemCarrito>(`${this.apiUrl}${itemId}/`);
  }

  addItem(data: ItemCarritoCreate): Observable<ItemCarrito> {
    return this.http.post<ItemCarrito>(this.apiUrl, data);
  }

  updateItem(itemId: string, data: Partial<ItemCarritoCreate>): Observable<ItemCarrito> {
    return this.http.put<ItemCarrito>(`${this.apiUrl}${itemId}/`, data);
  }

  deleteItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${itemId}/`);
  }
}