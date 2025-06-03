import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartStateService } from '../../../services/cart-state.service';
import { PedidoLocalService } from '../../../services/pedido-local-service.service'; // 
import { KeycloakService } from '../../../services/keycloak.service';
import { ItemCarrito } from '../../../models/item_carrito.model';
import { PedidoCreate, Pedido } from '../../../models/pedido.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  items: ItemCarrito[] = [];
  total: number = 0;
  totalItems: number = 0;
  isProcessingOrder: boolean = false;
  isAdmin: boolean = false;
  userInfo: any = null;
  isAuthenticated: boolean = false;
  
  private subscription = new Subscription();

  constructor(
    private cartState: CartStateService,
    private pedidoService: PedidoLocalService, // ✅ Usar servicio local
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('🛒 Inicializando CartComponent...');
    
    // ✅ Verificar autenticación y roles de forma segura
    try {
      this.isAuthenticated = this.keycloakService.isLoggedInUser();
      
      if (this.isAuthenticated) {
        this.isAdmin = this.keycloakService.hasRole('administrator');
        this.userInfo = this.keycloakService.getUserInfoSync();
        console.log('👤 Usuario autenticado:', this.userInfo?.preferred_username, 'Admin:', this.isAdmin);
      } else {
        this.isAdmin = false;
        this.userInfo = null;
        console.log('👤 Usuario anónimo');
      }
    } catch (error) {
      console.log('ℹ️ Error verificando autenticación, asumiendo usuario anónimo:', error);
      this.isAuthenticated = false;
      this.isAdmin = false;
      this.userInfo = null;
    }

    // ✅ Si es admin autenticado, redirigir
    if (this.isAdmin) {
      console.warn('❌ Admin no puede acceder al carrito, redirigiendo...');
      this.router.navigate(['/admin']);
      return;
    }

    // ✅ Cargar carrito para usuarios normales (autenticados o anónimos)
    console.log('🛒 Cargando carrito...');
    const cartSubscription = this.cartState.items$.subscribe(items => {
      console.log('🛒 Subscription triggered con items:', items);
      this.items = items;
      this.calculateTotals();
      console.log('🛒 Items asignados:', this.items.length, 'Total:', this.total);
    });
    this.subscription.add(cartSubscription);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  calculateTotals() {
    this.totalItems = this.items.reduce((sum, item) => sum + item.cantidad, 0);
    this.total = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    console.log('📊 Totales calculados:', { totalItems: this.totalItems, total: this.total });
  }

  updateQuantity(itemId: string, newQuantity: number) {
    if (this.isAdmin) return;
    
    if (newQuantity < 1) {
      this.removeItem(itemId);
      return;
    }
    this.cartState.updateItemQuantity(itemId, newQuantity);
  }

  removeItem(itemId: string) {
    if (this.isAdmin) return;
    this.cartState.removeItem(itemId);
  }

  clearCart() {
    if (this.isAdmin) return;
    
    if (confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
      this.cartState.clearCart();
    }
  }

  finalizarCompra() {
    if (this.isAdmin) {
      alert('Los administradores no pueden realizar compras');
      return;
    }

    if (this.items.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    // ✅ Si no está autenticado, solicitar login
    if (!this.isAuthenticated) {
      const shouldLogin = confirm(
        'Para finalizar tu compra necesitas iniciar sesión.\n\n' +
        '¿Quieres iniciar sesión ahora?\n\n' +
        '(Tu carrito se conservará)'
      );
      
      if (shouldLogin) {
        this.keycloakService.login();
      }
      return;
    }

    if (this.isProcessingOrder) {
      return;
    }

    const confirmacion = confirm(
      `¿Confirmar pedido por $${this.total}?\n\n` +
      `Productos: ${this.totalItems}\n` +
      `Total: $${this.total}`
    );

    if (confirmacion) {
      this.procesarPedido();
    }
  }

  // ✅ Procesamiento LOCAL del pedido
  private procesarPedido() {
    this.isProcessingOrder = true;
    console.log('🛒 === INICIANDO PROCESAMIENTO DE PEDIDO LOCAL ===');

    // ✅ Usar el ID del usuario autenticado o generar uno temporal
    const clienteId = this.userInfo?.sub || 'cliente-anonimo-' + Date.now();
    
    const pedidoData: PedidoCreate = {
      cliente_id: clienteId,
      cliente_nombre: this.userInfo?.name || this.userInfo?.preferred_username || 'Cliente Nuevo',
      cliente_correo: this.userInfo?.email || `${clienteId}@neuralshoes.com`,
      cliente_telefono: this.userInfo?.phone_number || '',
      estado: 'Pendiente',
      items: this.items.map(item => ({
        variacion_id: item.variacion.id,
        cantidad: item.cantidad,
        precio_unitario: item.variacion.producto.precio,
        subtotal: item.subtotal
      })),
      total: this.total,
      subtotal: this.total
    };

    console.log('📦 Datos del pedido a crear (LOCAL):', pedidoData);
    console.log('🎯 LLAMANDO a pedidoLocalService.crearPedido()...');

    // ✅ Crear pedido usando el servicio LOCAL
    const crearPedidoSub = this.pedidoService.crearPedido(pedidoData, this.items).subscribe({
      next: (response) => {
        console.log('✅ Respuesta de crear pedido LOCAL:', response);
        if (response.success) {
          this.mostrarConfirmacionPedido(response.pedido!);
          this.cartState.clearCart();
          
          // ✅ Redirigir a la página de pedidos
          setTimeout(() => {
            this.router.navigate(['/orders']);
          }, 2000);
        } else {
          alert('Error al crear el pedido: ' + response.message);
        }
        this.isProcessingOrder = false;
      },
      error: (error) => {
        console.error('❌ Error al procesar pedido LOCAL:', error);
        alert('Error al procesar el pedido. Intenta nuevamente.');
        this.isProcessingOrder = false;
      }
    });

    this.subscription.add(crearPedidoSub);
    console.log('🛒 FIN procesarPedido() - Suscripción agregada');
  }

  private mostrarConfirmacionPedido(pedido: Pedido) {
    alert(
      `¡Pedido creado exitosamente! 🎉\n\n` +
      `Número de pedido: ${pedido.id}\n` +
      `Cliente: ${pedido.cliente.nombre}\n` +
      `Email: ${pedido.cliente.correo}\n` +
      `Productos: ${pedido.items.length}\n` +
      `Total: $${pedido.total}\n` +
      `Estado: ${pedido.estado}\n\n` +
      `💾 Guardado localmente ✅\n` +
      `Serás redirigido a la página de pedidos.`
    );
  }

  // ✅ Método trackBy correctamente formateado
  trackByItemId(index: number, item: ItemCarrito): string {
    return item.id;
  }

  // ✅ Método para debug (opcional)
  debugCart() {
    console.log('🛒 Debug Cart Component:');
    console.log('- Items:', this.items);
    console.log('- Total:', this.total);
    console.log('- User Info:', this.userInfo);
    console.log('- Is Authenticated:', this.isAuthenticated);
    console.log('- Is Admin:', this.isAdmin);
  }
}