import { ItemCarrito } from './item_carrito.model';

export interface Carrito {
  id: string;
  cliente: string;
  actualizado: string;
  items: ItemCarrito[];
  total: number;
}
