import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pedido, PedidoCreate, EstadoPedido } from '../models/pedido.model';
import { ItemCarrito } from '../models/item_carrito.model';
import { v4 as uuidv4 } from 'uuid';

export interface PedidoResponse {
  success: boolean;
  message: string;
  pedido?: Pedido;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoLocalService {
  private readonly STORAGE_KEY = 'neural_shoes_pedidos';
  
  // ✅ BehaviorSubject para estado reactivo
  private pedidosSubject = new BehaviorSubject<Pedido[]>([]);
  public pedidos$ = this.pedidosSubject.asObservable();

  constructor() {
    console.log('📦 PedidoLocalService inicializado');
    this.cargarPedidosDesdeStorage();
  }

  // ✅ Cargar pedidos desde localStorage
  private cargarPedidosDesdeStorage() {
    try {
      const pedidosJSON = localStorage.getItem(this.STORAGE_KEY);
      if (pedidosJSON) {
        const pedidos: Pedido[] = JSON.parse(pedidosJSON);
        this.pedidosSubject.next(pedidos);
        console.log('📦 Pedidos cargados desde localStorage:', pedidos.length);
      } else {
        console.log('📦 No hay pedidos guardados en localStorage');
        this.pedidosSubject.next([]);
      }
    } catch (error) {
      console.error('❌ Error cargando pedidos desde localStorage:', error);
      this.pedidosSubject.next([]);
    }
  }

  // ✅ Guardar pedidos en localStorage
  private guardarPedidosEnStorage(pedidos: Pedido[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pedidos));
      console.log('💾 Pedidos guardados en localStorage:', pedidos.length);
    } catch (error) {
      console.error('❌ Error guardando pedidos en localStorage:', error);
    }
  }

  // ✅ Obtener todos los pedidos (desde localStorage)
  obtenerPedidos(): Observable<Pedido[]> {
    console.log('📦 Obteniendo pedidos desde localStorage...');
    
    // Simular delay de API para realismo
    setTimeout(() => {
      this.cargarPedidosDesdeStorage();
    }, 100);
    
    return this.pedidos$;
  }

  // ✅ Crear pedido y guardarlo en localStorage
  crearPedido(pedidoData: PedidoCreate, items: ItemCarrito[]): Observable<PedidoResponse> {
    console.log('🎯 CREAR PEDIDO LOCAL - Datos:', pedidoData);
    console.log('🛒 Items del carrito:', items);
    
    return new Observable(observer => {
      try {
        // ✅ Generar ID único para el pedido
        const pedidoId = uuidv4();
        const fechaActual = new Date().toISOString();
        
        // ✅ Crear cliente si no existe
        const cliente = {
          id: pedidoData.cliente_id,
          nombre: pedidoData.cliente_nombre || 'Cliente Nuevo',
          correo: pedidoData.cliente_correo || `${pedidoData.cliente_id}@neuralshoes.com`,
          telefono: pedidoData.cliente_telefono || '',
          fecha_registro: fechaActual
        };

        // ✅ Transformar items del carrito a items del pedido
        const itemsPedido = items.map(item => ({
          id: uuidv4(),
          variacion: item.variacion,
          cantidad: item.cantidad,
          precio_unitario: item.variacion.producto.precio,
          subtotal: item.subtotal
        }));

        // ✅ Crear objeto pedido completo
        const nuevoPedido: Pedido = {
          id: pedidoId,
          cliente: cliente,
          items: itemsPedido,
          estado: pedidoData.estado,
          total: pedidoData.total,
          subtotal: pedidoData.subtotal,
          fecha_pedido: fechaActual
        };

        // ✅ Obtener pedidos actuales y agregar el nuevo
        const pedidosActuales = this.pedidosSubject.value;
        const pedidosActualizados = [nuevoPedido, ...pedidosActuales];
        
        // ✅ Guardar en localStorage y actualizar BehaviorSubject
        this.guardarPedidosEnStorage(pedidosActualizados);
        this.pedidosSubject.next(pedidosActualizados);

        console.log('✅ Pedido creado y guardado en localStorage:', nuevoPedido);

        // ✅ Responder con éxito
        observer.next({
          success: true,
          message: 'Pedido creado exitosamente (guardado localmente)',
          pedido: nuevoPedido
        });
        observer.complete();

      } catch (error) {
        console.error('❌ Error creando pedido local:', error);
        observer.error({
          success: false,
          message: 'Error al crear pedido: ' + error
        });
      }
    });
  }

  // ✅ Actualizar estado del pedido
  actualizarEstadoPedido(pedidoId: string, nuevoEstado: EstadoPedido): Observable<PedidoResponse> {
    console.log(`📦 Actualizando estado del pedido ${pedidoId} a ${nuevoEstado}`);
    
    return new Observable(observer => {
      try {
        const pedidosActuales = this.pedidosSubject.value;
        const index = pedidosActuales.findIndex(p => p.id === pedidoId);
        
        if (index === -1) {
          observer.error({
            success: false,
            message: 'Pedido no encontrado'
          });
          return;
        }

        // ✅ Actualizar estado
        const pedidosActualizados = [...pedidosActuales];
        pedidosActualizados[index] = {
          ...pedidosActualizados[index],
          estado: nuevoEstado
        };

        // ✅ Guardar y actualizar
        this.guardarPedidosEnStorage(pedidosActualizados);
        this.pedidosSubject.next(pedidosActualizados);

        observer.next({
          success: true,
          message: 'Estado actualizado correctamente',
          pedido: pedidosActualizados[index]
        });
        observer.complete();

      } catch (error) {
        console.error('❌ Error actualizando estado:', error);
        observer.error({
          success: false,
          message: 'Error al actualizar estado: ' + error
        });
      }
    });
  }

  // ✅ Obtener pedido por ID
  obtenerPedidoPorId(pedidoId: string): Observable<Pedido | null> {
    const pedidos = this.pedidosSubject.value;
    const pedido = pedidos.find(p => p.id === pedidoId);
    return new Observable(observer => {
      observer.next(pedido || null);
      observer.complete();
    });
  }

  // ✅ Refrescar pedidos
  refrescarPedidos(): Observable<Pedido[]> {
    console.log('🔄 Refrescando pedidos desde localStorage...');
    this.cargarPedidosDesdeStorage();
    return this.pedidos$;
  }

  // ✅ Debug: Ver estado actual
  debugPedidos() {
    console.log('📦 Debug - Estado actual de pedidos:', this.pedidosSubject.value);
    console.log('💾 localStorage:', localStorage.getItem(this.STORAGE_KEY));
    return this.pedidosSubject.value;
  }

  // ✅ Obtener estado actual sin suscripción
  getPedidosActuales(): Pedido[] {
    return this.pedidosSubject.value;
  }

  // ✅ Limpiar todos los pedidos (para testing)
  limpiarPedidos() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.pedidosSubject.next([]);
    console.log('🗑️ Todos los pedidos eliminados');
  }

  // ✅ Exportar pedidos para backup
  exportarPedidos(): string {
    return JSON.stringify(this.pedidosSubject.value, null, 2);
  }

  // ✅ Importar pedidos desde backup
  importarPedidos(pedidosJSON: string): boolean {
    try {
      const pedidos: Pedido[] = JSON.parse(pedidosJSON);
      this.guardarPedidosEnStorage(pedidos);
      this.pedidosSubject.next(pedidos);
      console.log('📥 Pedidos importados exitosamente:', pedidos.length);
      return true;
    } catch (error) {
      console.error('❌ Error importando pedidos:', error);
      return false;
    }
  }
}