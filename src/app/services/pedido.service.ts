import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Pedido, PedidoCreate, EstadoPedido } from '../models/pedido.model';
import { ItemCarrito } from '../models/item_carrito.model';
import { environment } from '../environments/environment'; // ✅ Ruta corregida

export interface PedidoResponse {
  success: boolean;
  message: string;
  pedido?: Pedido;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  // ✅ Usar apiBaseUrl del environment
  private readonly PEDIDOS_URL = `${environment.apiBaseUrl}pedidos/`;
  private readonly DETALLE_PEDIDO_URL = `${environment.apiBaseUrl}detalle-pedidos/`;
  private readonly CLIENTES_URL = `${environment.apiBaseUrl}clientes/`;
  
  // ✅ BehaviorSubject para manejar estado reactivo de pedidos
  private pedidosSubject = new BehaviorSubject<Pedido[]>([]);
  public pedidos$ = this.pedidosSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('📦 PedidoService inicializado');
    console.log('🔗 URLs de API:', {
      pedidos: this.PEDIDOS_URL,
      detalles: this.DETALLE_PEDIDO_URL,
      clientes: this.CLIENTES_URL
    });
    
    // ✅ Cargar pedidos al inicializar el servicio
    this.cargarPedidosIniciales();
  }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
  }

  // ✅ Cargar pedidos desde la API al inicializar
  private cargarPedidosIniciales() {
    this.obtenerPedidos().subscribe({
      next: (pedidos) => {
        console.log('📦 Pedidos iniciales cargados desde API:', pedidos.length);
      },
      error: (error) => {
        console.error('❌ Error al cargar pedidos iniciales:', error);
      }
    });
  }

  // ✅ Obtener todos los pedidos usando tu ViewSet existente
  obtenerPedidos(): Observable<Pedido[]> {
    console.log('📦 Obteniendo pedidos desde API...');
    
    return this.http.get<any[]>(this.PEDIDOS_URL, this.getHttpOptions()).pipe(
      map(response => {
        // ✅ Transformar la respuesta a formato Angular
        const pedidos: Pedido[] = response.map(pedido => this.transformarPedidoDesdeAPI(pedido));
        
        // ✅ Actualizar BehaviorSubject con datos de la API
        this.pedidosSubject.next(pedidos);
        return pedidos;
      }),
      tap(pedidos => console.log('📦 Pedidos obtenidos desde API:', pedidos.length)),
      catchError(error => {
        console.error('❌ Error en obtenerPedidos():', error);
        throw error;
      })
    );
  }

  // ✅ Crear pedido usando tus ViewSets existentes
  crearPedido(pedidoData: PedidoCreate, items: ItemCarrito[]): Observable<PedidoResponse> {
    console.log('🎯 CREAR PEDIDO - Enviando a API:', pedidoData);
    console.log('🛒 Items del carrito:', items);
    
    return new Observable(observer => {
      // ✅ 1. Primero crear/verificar cliente
      this.crearOVerificarCliente(pedidoData).subscribe({
        next: (cliente) => {
          console.log('👤 Cliente verificado:', cliente);
          
          // ✅ 2. Luego crear el pedido
          const pedidoPayload = {
            cliente_id: cliente.id,
            estado: pedidoData.estado
          };
          
          this.http.post<any>(this.PEDIDOS_URL, pedidoPayload, this.getHttpOptions()).subscribe({
            next: (pedidoCreado) => {
              console.log('📦 Pedido creado en API:', pedidoCreado);
              
              // ✅ 3. Crear detalles del pedido
              this.crearDetallesPedido(pedidoCreado.id, pedidoData.items).subscribe({
                next: (detalles) => {
                  console.log('📝 Detalles creados:', detalles);
                  
                  // ✅ 4. Obtener pedido completo para actualizar estado
                  this.obtenerPedidoCompleto(pedidoCreado.id).subscribe({
                    next: (pedidoCompleto) => {
                      // ✅ Agregar al BehaviorSubject
                      const pedidosActuales = this.pedidosSubject.value;
                      const pedidosActualizados = [pedidoCompleto, ...pedidosActuales];
                      this.pedidosSubject.next(pedidosActualizados);
                      
                      observer.next({
                        success: true,
                        message: 'Pedido creado exitosamente',
                        pedido: pedidoCompleto
                      });
                      observer.complete();
                    },
                    error: (error) => {
                      console.error('❌ Error al obtener pedido completo:', error);
                      observer.error(error);
                    }
                  });
                },
                error: (error) => {
                  console.error('❌ Error al crear detalles:', error);
                  observer.error(error);
                }
              });
            },
            error: (error) => {
              console.error('❌ Error al crear pedido:', error);
              observer.error(error);
            }
          });
        },
        error: (error) => {
          console.error('❌ Error al verificar cliente:', error);
          observer.error(error);
        }
      });
    });
  }

  // ✅ Crear o verificar cliente
  private crearOVerificarCliente(pedidoData: PedidoCreate): Observable<any> {
    const clienteId = pedidoData.cliente_id;
    
    // ✅ Primero intentar obtener el cliente existente
    return this.http.get<any>(`${this.CLIENTES_URL}${clienteId}/`, this.getHttpOptions()).pipe(
      catchError(() => {
        // ✅ Si no existe, crear nuevo cliente
        const nuevoCliente = {
          id: clienteId,
          nombre: pedidoData.cliente_nombre || 'Cliente Nuevo',
          correo: pedidoData.cliente_correo || `${clienteId}@neuralshoes.com`,
          telefono: pedidoData.cliente_telefono || ''
        };
        
        console.log('👤 Creando nuevo cliente:', nuevoCliente);
        return this.http.post<any>(this.CLIENTES_URL, nuevoCliente, this.getHttpOptions());
      })
    );
  }

  // ✅ Crear detalles del pedido
  private crearDetallesPedido(pedidoId: string, items: any[]): Observable<any[]> {
    const detallesPromises = items.map(item => {
      const detallePayload = {
        pedido_id: pedidoId,
        producto_talla_color_id: item.variacion_id,
        cantidad: item.cantidad
      };
      
      return this.http.post<any>(this.DETALLE_PEDIDO_URL, detallePayload, this.getHttpOptions()).toPromise();
    });
    
    return new Observable(observer => {
      Promise.all(detallesPromises).then(
        detalles => {
          observer.next(detalles);
          observer.complete();
        },
        error => observer.error(error)
      );
    });
  }

  // ✅ Obtener pedido completo con detalles
  private obtenerPedidoCompleto(pedidoId: string): Observable<Pedido> {
    return this.http.get<any>(`${this.PEDIDOS_URL}${pedidoId}/`, this.getHttpOptions()).pipe(
      map(pedido => this.transformarPedidoDesdeAPI(pedido))
    );
  }

  // ✅ Transformar pedido desde formato API a formato Angular
  private transformarPedidoDesdeAPI(pedidoAPI: any): Pedido {
    return {
      id: pedidoAPI.id,
      cliente: {
        id: pedidoAPI.cliente.id || pedidoAPI.cliente,
        nombre: pedidoAPI.cliente.nombre || 'Cliente',
        correo: pedidoAPI.cliente.correo || '',
        telefono: pedidoAPI.cliente.telefono || '',
        fecha_registro: pedidoAPI.cliente.fecha_registro || new Date().toISOString()
      },
      items: [], // Se llenarán con una llamada separada si es necesario
      estado: pedidoAPI.estado as EstadoPedido, // ✅ Cast al tipo correcto
      total: 0, // Se calculará con los detalles
      subtotal: 0,
      fecha_pedido: pedidoAPI.fecha_pedido
    };
  }

  // ✅ Obtener detalles de un pedido específico
  private obtenerDetallesPorPedido(pedidoId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.DETALLE_PEDIDO_URL}?pedido=${pedidoId}`, this.getHttpOptions());
  }

  // ✅ Actualizar estado del pedido usando tu ViewSet
  actualizarEstadoPedido(pedidoId: string, nuevoEstado: EstadoPedido): Observable<PedidoResponse> {
    console.log(`📦 Actualizando estado del pedido ${pedidoId} a ${nuevoEstado}`);
    
    const payload = { estado: nuevoEstado };
    
    return this.http.patch<any>(`${this.PEDIDOS_URL}${pedidoId}/`, payload, this.getHttpOptions()).pipe(
      map(response => {
        // ✅ Actualizar el pedido en el BehaviorSubject
        const pedidosActuales = this.pedidosSubject.value;
        const index = pedidosActuales.findIndex(p => p.id === pedidoId);
        
        if (index !== -1) {
          const pedidosActualizados = [...pedidosActuales];
          pedidosActualizados[index] = {
            ...pedidosActualizados[index],
            estado: nuevoEstado
          };
          this.pedidosSubject.next(pedidosActualizados);
        }
        
        return {
          success: true,
          message: 'Estado actualizado correctamente',
          pedido: this.transformarPedidoDesdeAPI(response)
        };
      }),
      catchError(error => {
        console.error('❌ Error al actualizar estado:', error);
        throw error;
      })
    );
  }

  // ✅ Obtener pedido por ID desde la API
  obtenerPedidoPorId(pedidoId: string): Observable<Pedido | null> {
    return this.http.get<any>(`${this.PEDIDOS_URL}${pedidoId}/`, this.getHttpOptions()).pipe(
      map(response => this.transformarPedidoDesdeAPI(response)),
      catchError(error => {
        console.error('❌ Error al obtener pedido por ID:', error);
        return [null];
      })
    );
  }

  // ✅ Refrescar pedidos desde la API
  refrescarPedidos(): Observable<Pedido[]> {
    console.log('🔄 Refrescando pedidos desde API...');
    return this.obtenerPedidos();
  }

  // ✅ Método para debug: Ver estado actual
  debugPedidos() {
    console.log('📦 Debug - Estado actual de pedidos:', this.pedidosSubject.value);
    return this.pedidosSubject.value;
  }

  // ✅ Obtener estado actual sin suscripción
  getPedidosActuales(): Pedido[] {
    return this.pedidosSubject.value;
  }
}