export interface Category {
  id: string;
  nombre: string;
  descripcion?: string | null;
}

export interface CategoryCreate {
  nombre: string;
  descripcion?: string;
}