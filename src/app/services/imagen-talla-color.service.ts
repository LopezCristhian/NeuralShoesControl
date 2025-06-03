import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ProductoTallaColor, ProductoTallaColorCreate } from '../models/product_talla_color.model';
import { ProductImage } from '../models/product_image.model';
import { Color } from '../models/color.model';
import { Size } from '../models/size.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImagenTallaColorService {
  private apiPTC = `${environment.apiBaseUrl}productos-talla-color/`;
  private apiImage = `${environment.apiBaseUrl}producto-imagenes/`;
  private apiColors = `${environment.apiBaseUrl}colores/`;
  private apiSizes = `${environment.apiBaseUrl}tallas/`;

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

  // Método principal para obtener imágenes por producto (CON FILTRO GARANTIZADO)
getProductImages(productId: string): Observable<ProductImage[]> {
  return this.http.get<ProductImage[]>(`${this.apiImage}?producto=${productId}`).pipe(
    map(images => {
      // Filtro robusto que maneja string y number
      const filteredImages = images.filter(img => {
        return String(img.producto) === String(productId);
      });
      
      console.log(`Imágenes para producto ${productId}:`, filteredImages.length, 'de', images.length);
      return filteredImages;
    })
  );
}


// Método alternativo: obtener todas y filtrar en frontend
getProductImagesFallback(productId: string): Observable<ProductImage[]> {
  return this.http.get<ProductImage[]>(this.apiImage).pipe(
    map(images => {
      console.log('Todas las imágenes del backend:', images);
      console.log('Filtrando para producto:', productId);
      
      const filtered = images.filter(img => {
        // Comparaciones múltiples para manejar diferentes tipos
        return String(img.producto) === String(productId) || 
               Number(img.producto) === Number(productId) ||
               img.producto === productId;
      });
      
      console.log('Imágenes filtradas para producto', productId, ':', filtered);
      return filtered;
    })
  );
}

// Método para subir imagen de producto
uploadProductImage(productId: string, file: File): Observable<ProductImage> {
  const formData = new FormData();
  formData.append('producto', productId);
  formData.append('imagen', file);
  return this.http.post<ProductImage>(this.apiImage, formData);
}

// Método para eliminar imagen de producto
deleteProductImage(productId: string, imageId: string): Observable<any> {
  return this.http.delete(`${this.apiImage}${imageId}/`);
}

// Métodos para obtener todos los colores y tallas
getColors(): Observable<Color[]> {
  return this.http.get<Color[]>(this.apiColors);
}

getSizes(): Observable<Size[]> {
  return this.http.get<Size[]>(this.apiSizes);
}

  // Métodos legacy (mantener para compatibilidad)
  getImagesByProduct(productId: string): Observable<ProductImage[]> {
    return this.getProductImages(productId);
  }

  uploadImage(productId: string, file: File): Observable<ProductImage> {
    return this.uploadProductImage(productId, file);
  }

  deleteImage(imageId: string): Observable<any> {
    return this.http.delete(`${this.apiImage}${imageId}/`);
  }
}