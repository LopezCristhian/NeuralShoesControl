import { Product } from "./product.model";
import { Brand } from "./brand.model";
import { Color } from "./color.model";
import { Size } from "./size.model";

export interface ProductoTallaColor {
  id: string;
  producto: Product;
  talla: Size;
  color: Color;
  stock: number;
}

export interface ProductoTallaColorCreate {
  producto_id: string;
  talla_id: string;
  color_id: string;
  stock: number;
}