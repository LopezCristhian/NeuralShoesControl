import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CategoryCreate } from '../../../models/category.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiBaseUrl}categorias/`;

  constructor(private http: HttpClient) {}

  // Obtener todas las categorías
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  // Obtener una categoría por ID
  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}${id}/`);
  }

  // Crear nueva categoría
  createCategory(category: CategoryCreate): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  // Actualizar categoría
  updateCategory(id: string, category: CategoryCreate): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}${id}/`, category);
  }

  // Eliminar categoría
  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}