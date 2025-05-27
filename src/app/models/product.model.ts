import { Brand } from './brand.model';
import { Color } from './color.model';
import { Size } from './size.model';
import { ProductImage } from './product_image.model';

export interface Product {
  id: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock_total: number;
  imagenes: ProductImage[];
  marca: Brand;
  colores: Color[];
  tallas: Size[];
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock_total?: number;
  marca_id: string;
}