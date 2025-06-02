import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Carrito } from '../models/carrito.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = 'http://localhost:8000/api/carritos/';

  constructor(private http: HttpClient) {}

  getCarritos(): Observable<Carrito[]> {
    return this.http.get<Carrito[]>(this.apiUrl);
  }

  getCarritoById(carritoId: string): Observable<Carrito> {
    return this.http.get<Carrito>(`${this.apiUrl}${carritoId}/`);
  }

  createCarrito(data: Partial<Carrito>): Observable<Carrito> {
    return this.http.post<Carrito>(this.apiUrl, data);
  }

  updateCarrito(carritoId: string, data: Partial<Carrito>): Observable<Carrito> {
    return this.http.put<Carrito>(`${this.apiUrl}${carritoId}/`, data);
  }

  deleteCarrito(carritoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${carritoId}/`);
  }
}