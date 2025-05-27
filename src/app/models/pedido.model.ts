import { Cliente } from "./client.model";

export interface Pedido {
  id: string;
  cliente: Cliente;
  fecha_pedido: string;
  estado: 'Pendiente' | 'Enviado' | 'Entregado' | 'Cancelado';
}

export interface PedidoCreate {
  cliente_id: string;
  estado: string;
}
