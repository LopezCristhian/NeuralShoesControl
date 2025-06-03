import { Cliente } from "./client.model";
import { ProductoTallaColor } from "./product_talla_color.model";

// ✅ Tipos de estado del pedido
export type EstadoPedido = 'Pendiente' | 'Enviado' | 'Entregado' | 'Cancelado';

// ✅ Interface específica para items de pedidos
export interface ItemPedido {
  id: string;
  variacion: ProductoTallaColor;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Pedido {
  id: string;
  cliente: Cliente;
  fecha_pedido: string;
  estado: EstadoPedido;
  items: ItemPedido[];
  total: number;
  subtotal: number;
  impuestos?: number;
  descuento?: number;
}

export interface PedidoCreate {
  cliente_id: string;
  cliente_nombre?: string;  // ✅ Agregado como opcional
  cliente_correo?: string;  // ✅ Agregado como opcional
  cliente_telefono?: string; // ✅ Agregado como opcional
  estado: EstadoPedido;     // ✅ Usar tipo específico
  items: {
    variacion_id: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
  total: number;
  subtotal: number;
}

export interface PedidoResponse {
  success: boolean;
  pedido?: Pedido;
  message: string;
}