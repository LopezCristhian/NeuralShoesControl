import { Category } from './category.model';

export interface Brand {
  id: string;
  nombre: string;
  descripcion?: string | null;
  imagen?: string | null;
  categorias: Category[];
}

export interface BrandCreate {
  nombre: string;
  descripcion?: string;
  imagen?: File | null;
  categorias_id: string[];
}