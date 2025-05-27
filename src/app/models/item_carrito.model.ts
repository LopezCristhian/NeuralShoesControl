import { ProductoTallaColor } from './product_talla_color.model';

export interface ItemCarrito {
  id: string;
  carrito: string;
  variacion: ProductoTallaColor;
  cantidad: number;
  subtotal: number;
}

export interface ItemCarritoCreate {
  carrito_id: string;
  variacion_id: string;
  cantidad: number;
}
