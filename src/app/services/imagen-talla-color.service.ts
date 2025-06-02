import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductoTallaColor, ProductoTallaColorCreate } from '../models/product_talla_color.model';
import { ProductImage } from '../models/product_image.model';
import { Color } from '../models/color.model';
import { Size } from '../models/size.model';

@Injectable({
  providedIn: 'root'
})
export class ImagenTallaColorService {
  private apiPTC = 'http://localhost:8000/api/productos-talla-color/';
  private apiImage = 'http://localhost:8000/api/producto-imagenes/';
  private apiColors = 'http://localhost:8000/api/colores/';
  private apiSizes = 'http://localhost:8000/api/tallas/';

  constructor(private http: HttpClient) {}

  // Métodos para ProductoTallaColor
  getAllPTC(): Observable<ProductoTallaColor[]> {
    return this.http.get<ProductoTallaColor[]>(this.apiPTC);
  }

  createPTC(data: ProductoTallaColorCreate): Observable<ProductoTallaColor> {
    return this.http.post<ProductoTallaColor>(this.apiPTC, data);
  }

  updatePTC(id: string, data: Partial<ProductoTallaColorCreate>): Observable<ProductoTallaColor> {
    return this.http.put<ProductoTallaColor>(`${this.apiPTC}${id}/`, data);
  }

  deletePTC(id: string): Observable<any> {
    return this.http.delete(`${this.apiPTC}${id}/`);
  }

  getPTCByProduct(productId: string): Observable<ProductoTallaColor[]> {
    return this.http.get<ProductoTallaColor[]>(`${this.apiPTC}?producto_id=${productId}`);
  }

  // Métodos para imágenes de producto (globales)
  getImagesByProduct(productId: string): Observable<ProductImage[]> {
    return this.http.get<ProductImage[]>(`${this.apiImage}?producto=${productId}`);
  }

  uploadImage(productId: string, file: File): Observable<ProductImage> {
    const formData = new FormData();
    formData.append('producto', productId);
    formData.append('imagen', file);
    return this.http.post<ProductImage>(this.apiImage, formData);
  }

  deleteImage(imageId: string): Observable<any> {
    return this.http.delete(`${this.apiImage}${imageId}/`);
  }

  // Métodos explícitos para imágenes por producto
  getProductImages(productId: string): Observable<ProductImage[]> {
    // Alias de getImagesByProduct para claridad
    return this.getImagesByProduct(productId);
  }

  uploadProductImage(productId: string, file: File): Observable<ProductImage> {
    // Alias de uploadImage para claridad
    return this.uploadImage(productId, file);
  }

  deleteProductImage(productId: string, imageId: string): Observable<any> {
    // Si tu backend lo soporta, puedes usar un endpoint más explícito
    // return this.http.delete(`${this.apiImage}producto/${productId}/imagenes/${imageId}/`);
    // Si no, usa el global
    return this.deleteImage(imageId);
  }

  // Métodos para obtener todos los colores y tallas
  getColors(): Observable<Color[]> {
    return this.http.get<Color[]>(this.apiColors);
  }

  getSizes(): Observable<Size[]> {
    return this.http.get<Size[]>(this.apiSizes);
  }
}