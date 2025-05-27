import { Pedido } from "./pedido.model";

export interface Pago {
  id: string;
  pedido: Pedido;
  metodo_pago: 'Tarjeta' | 'Efectivo' | 'Transferencia' | 'PayPal';
}

export interface PagoCreate {
  pedido_id: string;
  metodo_pago: string;
}
