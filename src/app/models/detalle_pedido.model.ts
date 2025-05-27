import { ProductoTallaColor } from './product_talla_color.model';
import { Pedido } from './pedido.model';

export interface DetallePedido {
  id: string;
  pedido: Pedido;
  producto_talla_color: ProductoTallaColor;
  cantidad: number;
}

export interface DetallePedidoCreate {
  pedido_id: string;
  producto_talla_color_id: string;
  cantidad: number;
}
