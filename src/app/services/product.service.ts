import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiBaseUrl}productos/`;

  products: Product[] = [];
  selectedProduct: Product = {} as Product;


  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(products => products.map(p => ({
        ...p,
        stock: p.stock_total,
        precio: Number(p.precio)
      })))
    );
  }

}