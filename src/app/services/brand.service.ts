import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private apiUrl = 'http://localhost:8000/api/marcas/';

  constructor(private http: HttpClient) {}

  getBrands(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createBrand(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  updateBrand(id: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${id}/`, formData);
  }

  deleteBrand(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${id}/`);
  }
}