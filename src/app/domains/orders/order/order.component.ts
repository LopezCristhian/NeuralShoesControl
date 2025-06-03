import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PedidoLocalService } from '../../../services/pedido-local-service.service'; // ✅ CORREGIR ESTE IMPORT
import { KeycloakService } from '../../../services/keycloak.service';
import { Pedido, EstadoPedido } from '../../../models/pedido.model';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit, OnDestroy {
  pedidos: Pedido[] = [];
  isAdmin: boolean = false;
  isLoading: boolean = true;
  userInfo: any = null;
  estadosFiltro: string[] = ['Todos', 'Pendiente', 'Enviado', 'Entregado', 'Cancelado'];
  estadoSeleccionado: string = 'Todos';
  
  // ✅ Agregar esta propiedad para acceder desde el template
  get hasAdminRole(): boolean {
    return this.keycloakService.hasRole('administrator');
  }
  
  private subscription = new Subscription();
  


  constructor(
    private pedidoService: PedidoLocalService, // ✅ Usar servicio local
    private keycloakService: KeycloakService
  ) {}

  ngOnInit() {
    console.log('📦 Inicializando OrderComponent (LOCAL)...');
    
    try {
      this.isAdmin = this.keycloakService.hasRole('administrator');
      this.userInfo = this.keycloakService.getUserInfoSync();
      
      console.log('👤 Información del usuario:', {
        isAdmin: this.isAdmin,
        userInfo: this.userInfo,
        userId: this.userInfo?.sub,
        username: this.userInfo?.preferred_username
      });
    } catch (error) {
      console.log('⚠️ Error obteniendo información de usuario:', error);
      this.isAdmin = false;
      this.userInfo = null;
    }
    
    this.cargarPedidos();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // ✅ MÉTODO SIMPLIFICADO para cargar pedidos
// ✅ MÉTODO SIMPLIFICADO para cargar pedidos
cargarPedidos() {
  this.isLoading = true;
  console.log('📦 Cargando pedidos desde localStorage...');
  
  try {
    // ✅ 1. Cargar directamente desde el servicio
    const cargarSubscription = this.pedidoService.obtenerPedidos().subscribe({
      next: (pedidos) => {
        console.log('📦 Pedidos obtenidos del servicio local:', pedidos.length);
        console.log('📦 Lista completa de pedidos:', pedidos);
        
        if (this.isAdmin) {
          // ✅ ADMIN VE TODOS LOS PEDIDOS SIN FILTROS
          this.pedidos = pedidos;
          console.log('👤 Admin - Mostrando TODOS los pedidos:', pedidos.length);
          console.log('👤 Admin - Pedidos completos:', this.pedidos);
        } else {
          // ✅ Cliente solo ve sus pedidos
          const userId = this.userInfo?.sub || this.userInfo?.preferred_username;
          console.log('👤 Usuario actual para filtrar:', userId);
          
          this.pedidos = pedidos.filter(pedido => {
            const matches = pedido.cliente.id === userId || 
                           pedido.cliente.id.includes('cliente-anonimo') ||
                           pedido.cliente.id === '93d1a9b3-2352-4f31-b404-a943e9a3acaa' ||
                           pedido.cliente.id === 'clienteangular123';
            
            console.log(`Pedido ${pedido.id}: cliente=${pedido.cliente.id}, matches=${matches}`);
            return matches;
          });
          
          console.log('👤 Cliente - Pedidos filtrados:', this.pedidos.length);
        }
        
        this.isLoading = false;
        console.log('✅ Carga completada. Pedidos mostrados:', this.pedidos.length);
      },
      error: (error) => {
        console.error('❌ Error cargando pedidos:', error);
        this.isLoading = false;
      }
    });

    // ✅ 2. También suscribirse a los cambios reactivos
    const reactiveSubscription = this.pedidoService.pedidos$.subscribe({
      next: (pedidos) => {
        console.log('🔄 Actualización reactiva recibida:', pedidos.length);
        
        if (this.isAdmin) {
          // ✅ ADMIN VE TODOS SIN FILTROS
          this.pedidos = pedidos;
          console.log('🔄 Admin reactivo - Todos los pedidos:', this.pedidos.length);
        } else {
          // ✅ Cliente filtra sus pedidos
          const userId = this.userInfo?.sub || this.userInfo?.preferred_username;
          this.pedidos = pedidos.filter(pedido => {
            return pedido.cliente.id === userId || 
                   pedido.cliente.id.includes('cliente-anonimo') ||
                   pedido.cliente.id === '93d1a9b3-2352-4f31-b404-a943e9a3acaa' ||
                   pedido.cliente.id === 'clienteangular123';
          });
          console.log('🔄 Cliente reactivo - Pedidos filtrados:', this.pedidos.length);
        }
      }
    });

    this.subscription.add(cargarSubscription);
    this.subscription.add(reactiveSubscription);
    
  } catch (error) {
    console.error('❌ Error en cargarPedidos:', error);
    this.isLoading = false;
  }
}

  // ✅ Debug mejorado
  debugAdministrador() {
    console.log('🐛 =========================');
    console.log('🐛 DEBUG ADMINISTRADOR COMPLETO');
    console.log('🐛 =========================');
    
    // ✅ 1. Verificar importación del servicio
    console.log('🔧 1. Verificación del servicio:');
    console.log('- PedidoLocalService importado:', !!this.pedidoService);
    console.log('- Tipo de servicio:', this.pedidoService.constructor.name);
    
    // ✅ 2. Verificar métodos del servicio
    console.log('🔧 2. Métodos disponibles:');
    console.log('- obtenerPedidos:', typeof this.pedidoService.obtenerPedidos);
    console.log('- pedidos$:', !!this.pedidoService.pedidos$);
    console.log('- debugPedidos:', typeof this.pedidoService.debugPedidos);
    
    // ✅ 3. Estado del localStorage directo
    console.log('💾 3. localStorage directo:');
    const storageData = localStorage.getItem('neural_shoes_pedidos');
    console.log('- Datos en localStorage:', storageData);
    
    if (storageData) {
      try {
        const parsedData = JSON.parse(storageData);
        console.log('- Pedidos parseados:', parsedData);
        console.log('- Cantidad:', parsedData.length);
      } catch (e) {
        console.error('❌ Error parseando localStorage:', e);
      }
    }
    
    // ✅ 4. Llamar debug del servicio
    console.log('🔧 4. Debug del servicio:');
    if (this.pedidoService.debugPedidos) {
      this.pedidoService.debugPedidos();
    } else {
      console.log('❌ Método debugPedidos no disponible');
    }
    
    // ✅ 5. Estado del componente
    console.log('🎯 5. Estado del componente:');
    console.log('- this.pedidos:', this.pedidos);
    console.log('- this.isAdmin:', this.isAdmin);
    console.log('- this.isLoading:', this.isLoading);
    
    console.log('🐛 =========================');
  }


// Agregar después del método simularAdmin() (línea 166)

  simularCliente() {
    console.log('👤 Simulando vista de cliente...');
    this.isAdmin = false;
    
    // ✅ Recargar pedidos con vista de cliente
    this.cargarPedidos();
    
    alert('👤 Ahora ves los pedidos como cliente. Los pedidos se filtrarán por usuario.');
  }

  volverAAdmin() {
    console.log('👑 Volviendo a vista de administrador...');
    this.isAdmin = true;
    
    // ✅ Recargar pedidos con vista de admin
    this.cargarPedidos();
    alert('👑 Volviste a la vista de administrador. Ahora ves todos los pedidos.');
  }

  // ✅ Forzar creación de pedido de prueba simple
  crearPedidoPruebaSimple() {
    console.log('🧪 Creando pedido de prueba simple...');
    
    // ✅ Crear directamente en localStorage para testing
    const pedidoPrueba = {
      id: 'test-' + Date.now(),
      fecha_pedido: new Date().toISOString(),
      estado: 'Pendiente',
      cliente: {
        id: 'cliente-test-admin',
        nombre: 'Cliente Prueba Admin',
        correo: 'admin@test.com',
        telefono: '123456789'
      },
      items: [],
      total: 100,
      subtotal: 100
    };

    // ✅ Obtener pedidos existentes
    const pedidosExistentes = JSON.parse(localStorage.getItem('neural_shoes_pedidos') || '[]');
    
    // ✅ Agregar el nuevo
    pedidosExistentes.push(pedidoPrueba);
    
    // ✅ Guardar
    localStorage.setItem('neural_shoes_pedidos', JSON.stringify(pedidosExistentes));
    
    console.log('✅ Pedido de prueba creado:', pedidoPrueba);
    alert('✅ Pedido de prueba creado. Haz click en Refrescar.');
  }

  // ✅ El resto de métodos permanecen igual...
  get pedidosFiltrados(): Pedido[] {
    if (this.estadoSeleccionado === 'Todos') {
      return this.pedidos;
    }
    return this.pedidos.filter(pedido => pedido.estado === this.estadoSeleccionado);
  }

  cambiarEstadoPedido(pedidoId: string, nuevoEstado: string) {
    console.log('🔄 Cambiando estado del pedido (LOCAL):', pedidoId, 'a:', nuevoEstado);
    
    if (!this.isAdmin) {
      alert('Solo los administradores pueden cambiar el estado de los pedidos');
      return;
    }

    const estadosValidos: EstadoPedido[] = ['Pendiente', 'Enviado', 'Entregado', 'Cancelado'];
    if (!estadosValidos.includes(nuevoEstado as EstadoPedido)) {
      alert('Estado no válido');
      return;
    }

    const actualizarSubscription = this.pedidoService.actualizarEstadoPedido(
      pedidoId, 
      nuevoEstado as EstadoPedido
    ).subscribe({
      next: (response) => {
        console.log('📦 Respuesta del servicio (LOCAL):', response);
        if (response.success) {
          console.log('✅ Estado actualizado exitosamente en localStorage');
          alert(`✅ Estado del pedido actualizado a "${nuevoEstado}" exitosamente`);
        } else {
          alert('Error al actualizar estado: ' + response.message);
        }
      },
      error: (error) => {
        console.error('❌ Error al actualizar estado (LOCAL):', error);
        alert('Error al actualizar el estado del pedido');
      }
    });

    this.subscription.add(actualizarSubscription);
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'badge bg-warning text-dark';
      case 'Enviado': return 'badge bg-info text-white';
      case 'Entregado': return 'badge bg-success text-white';
      case 'Cancelado': return 'badge bg-danger text-white';
      default: return 'badge bg-secondary text-white';
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTotalItems(pedido: Pedido): number {
    return pedido.items.reduce((sum, item) => sum + item.cantidad, 0);
  }

  verDetallePedido(pedidoId: string) {
    const pedido = this.pedidos.find(p => p.id === pedidoId);
    if (!pedido) {
      alert('Pedido no encontrado');
      return;
    }

    let detalle = `📦 DETALLES DEL PEDIDO\n`;
    detalle += `ID: ${pedido.id}\n\n`;
    detalle += `👤 Cliente: ${pedido.cliente.nombre}\n`;
    detalle += `📧 Email: ${pedido.cliente.correo}\n`;
    detalle += `📱 Teléfono: ${pedido.cliente.telefono || 'No especificado'}\n`;
    detalle += `📅 Fecha: ${this.formatearFecha(pedido.fecha_pedido)}\n`;
    detalle += `🏷️ Estado: ${pedido.estado}\n`;
    detalle += `💾 Almacenado: localStorage\n\n`;
    
    if (pedido.items && pedido.items.length > 0) {
      detalle += `🛍️ PRODUCTOS:\n`;
      pedido.items.forEach((item, index) => {
        detalle += `${index + 1}. ${item.variacion?.producto?.nombre || 'Producto'}\n`;
        detalle += `   Marca: ${item.variacion?.producto?.marca?.nombre || 'Sin marca'}\n`;
        detalle += `   Color: ${item.variacion?.color?.nombre || 'Sin color'}\n`;
        detalle += `   Talla: ${item.variacion?.talla?.numero || 'Sin talla'}\n`;
        detalle += `   Cantidad: ${item.cantidad}\n`;
        detalle += `   Precio: $${item.precio_unitario}\n`;
        detalle += `   Subtotal: $${item.subtotal}\n\n`;
      });
    } else {
      detalle += `🛍️ PRODUCTOS: Sin items\n\n`;
    }
    
    detalle += `💰 TOTAL: $${pedido.total || 0}`;
    
    alert(detalle);
  }

  trackByPedidoId(index: number, pedido: Pedido): string {
    return pedido.id;
  }

  getConteoEstado(estado: string): number {
    return this.pedidos.filter(pedido => pedido.estado === estado).length;
  }

  refrescarPedidos() {
    console.log('🔄 Refrescando pedidos desde localStorage...');
    this.cargarPedidos();
  }

  crearPedidosDePrueba() {
    if (!this.isAdmin) {
      alert('Solo administradores pueden crear pedidos de prueba');
      return;
    }

    const confirmacion = confirm('¿Crear 3 pedidos de prueba para testing?');
    if (!confirmacion) return;

    const pedidosPrueba = [
      {
        cliente_id: 'cliente-prueba-1',
        cliente_nombre: 'Cliente Prueba 1',
        cliente_correo: 'prueba1@test.com',
        cliente_telefono: '123-456-7890',
        estado: 'Pendiente' as any,
        items: [],
        total: 150,
        subtotal: 150
      },
      {
        cliente_id: 'cliente-prueba-2',
        cliente_nombre: 'Cliente Prueba 2',
        cliente_correo: 'prueba2@test.com',
        cliente_telefono: '098-765-4321',
        estado: 'Enviado' as any,
        items: [],
        total: 200,
        subtotal: 200
      },
      {
        cliente_id: 'cliente-prueba-3',
        cliente_nombre: 'Cliente Prueba 3',
        cliente_correo: 'prueba3@test.com',
        cliente_telefono: '555-123-4567',
        estado: 'Entregado' as any,
        items: [],
        total: 300,
        subtotal: 300
      }
    ];

    let creados = 0;
    pedidosPrueba.forEach((pedidoData, index) => {
      this.pedidoService.crearPedido(pedidoData, []).subscribe({
        next: (response) => {
          creados++;
          console.log(`✅ Pedido de prueba ${index + 1} creado:`, response);
          
          if (creados === pedidosPrueba.length) {
            alert(`✅ ${creados} pedidos de prueba creados exitosamente`);
            this.refrescarPedidos();
          }
        },
        error: (error) => {
          console.error(`❌ Error creando pedido de prueba ${index + 1}:`, error);
        }
      });
    });
  }

  exportarPedidos() {
    if (!this.isAdmin) {
      alert('Solo los administradores pueden exportar pedidos');
      return;
    }

    try {
      const pedidosJSON = this.pedidoService.exportarPedidos();
      const blob = new Blob([pedidosJSON], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedidos_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert('📥 Pedidos exportados exitosamente');
      console.log('📥 Pedidos exportados');
    } catch (error) {
      console.error('❌ Error exportando pedidos:', error);
      alert('Error al exportar pedidos');
    }
  }

  importarPedidos() {
    if (!this.isAdmin) {
      alert('Solo los administradores pueden importar pedidos');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const success = this.pedidoService.importarPedidos(e.target.result);
            if (success) {
              alert('📤 Pedidos importados exitosamente');
            } else {
              alert('❌ Error importando pedidos. Verifica el formato del archivo.');
            }
          } catch (error) {
            console.error('❌ Error importando:', error);
            alert('❌ Error al procesar el archivo');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  limpiarTodosPedidos() {
    if (!this.isAdmin) {
      alert('Solo los administradores pueden eliminar pedidos');
      return;
    }

    const confirmacion = confirm(
      '🗑️ ¿Estás seguro de que quieres eliminar TODOS los pedidos?\n\n' +
      'Esta acción no se puede deshacer.\n\n' +
      '⚠️ Se recomienda hacer una exportación antes de continuar.'
    );

    if (confirmacion) {
      const segundaConfirmacion = confirm(
        '⚠️ CONFIRMACIÓN FINAL ⚠️\n\n' +
        'Se eliminarán TODOS los pedidos del localStorage.\n\n' +
        '¿Continuar?'
      );

      if (segundaConfirmacion) {
        this.pedidoService.limpiarPedidos();
        alert('🗑️ Todos los pedidos han sido eliminados del localStorage');
      }
    }
  }

  getEstadisticas() {
    const stats = {
      total: this.pedidos.length,
      pendientes: this.getConteoEstado('Pendiente'),
      enviados: this.getConteoEstado('Enviado'),
      entregados: this.getConteoEstado('Entregado'),
      cancelados: this.getConteoEstado('Cancelado'),
      totalVentas: this.pedidos.reduce((sum, p) => sum + (p.total || 0), 0)
    };

    const mensaje = `📊 ESTADÍSTICAS DE PEDIDOS\n\n` +
      `📦 Total de pedidos: ${stats.total}\n` +
      `⏳ Pendientes: ${stats.pendientes}\n` +
      `🚚 Enviados: ${stats.enviados}\n` +
      `✅ Entregados: ${stats.entregados}\n` +
      `❌ Cancelados: ${stats.cancelados}\n\n` +
      `💰 Total en ventas: $${stats.totalVentas.toFixed(2)}\n\n` +
      `💾 Almacenados en localStorage`;

    alert(mensaje);
    return stats;
  }
}