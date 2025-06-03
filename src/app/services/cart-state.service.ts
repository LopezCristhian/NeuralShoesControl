import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ItemCarrito } from '../models/item_carrito.model';
import { KeycloakService } from './keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class CartStateService {
  private itemsSubject = new BehaviorSubject<ItemCarrito[]>([]);
  public items$ = this.itemsSubject.asObservable();
  
  private readonly STORAGE_KEY = 'shopping_cart';

  constructor(private keycloakService: KeycloakService) {
    this.loadCartFromStorage();
  }

  // ✅ Obtener clave única por usuario (autenticado o anónimo)
  private getStorageKey(): string {
    let userId: string;
    
    try {
      // Intentar obtener el usuario autenticado
      const authenticatedUserId = this.keycloakService.getUserId();
      
      if (authenticatedUserId) {
        userId = authenticatedUserId;
      } else {
        // Si no hay usuario autenticado, usar un ID anónimo por navegador
        userId = this.getOrCreateAnonymousId();
      }
    } catch (error) {
      // Si hay error con Keycloak, usar ID anónimo
      userId = this.getOrCreateAnonymousId();
    }
    
    return `${this.STORAGE_KEY}_${userId}`;
  }

  // ✅ Crear o obtener ID anónimo único por navegador
  private getOrCreateAnonymousId(): string {
    const ANONYMOUS_KEY = 'anonymous_user_id';
    let anonymousId = localStorage.getItem(ANONYMOUS_KEY);
    
    if (!anonymousId) {
      // Generar un ID único para este navegador
      anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(ANONYMOUS_KEY, anonymousId);
    }
    
    return anonymousId;
  }

  // ✅ Verificar si el usuario es admin (con manejo de errores)
  private isAdmin(): boolean {
    try {
      return this.keycloakService.hasRole('administrator');
    } catch (error) {
      // Si no está autenticado o hay error, no es admin
      return false;
    }
  }

  // ✅ Los admins no deben tener carrito propio
  private shouldHaveCart(): boolean {
    return !this.isAdmin();
  }

  private loadCartFromStorage() {
    if (!this.shouldHaveCart()) {
      this.itemsSubject.next([]);
      return;
    }

    try {
      const storageKey = this.getStorageKey();
      const savedItems = localStorage.getItem(storageKey);
      if (savedItems) {
        const items = JSON.parse(savedItems);
        this.itemsSubject.next(items);
        console.log('✅ Carrito cargado desde localStorage:', items);
      } else {
        console.log('ℹ️ No hay carrito guardado, iniciando vacío');
      }
    } catch (error) {
      console.error('❌ Error loading cart from storage:', error);
      this.itemsSubject.next([]);
    }
  }

  private saveCartToStorage() {
    if (!this.shouldHaveCart()) {
      return;
    }

    try {
      const storageKey = this.getStorageKey();
      const items = this.itemsSubject.value;
      localStorage.setItem(storageKey, JSON.stringify(items));
      console.log('✅ Carrito guardado en localStorage:', storageKey, items);
    } catch (error) {
      console.error('❌ Error saving cart to storage:', error);
    }
  }

  addItem(item: ItemCarrito) {
    if (!this.shouldHaveCart()) {
      console.warn('❌ Los administradores no pueden agregar items al carrito');
      return;
    }

    console.log('🛒 Agregando item al carrito:', item);

    const currentItems = this.itemsSubject.value;
    const existingItemIndex = currentItems.findIndex(
      existing => existing.variacion.id === item.variacion.id
    );

    let updatedItems: ItemCarrito[];
    if (existingItemIndex !== -1) {
      // Actualizar cantidad si ya existe
      const existingItem = currentItems[existingItemIndex];
      const newQuantity = existingItem.cantidad + item.cantidad;
      const newSubtotal = this.calculateSubtotal(existingItem.variacion.producto.precio, newQuantity);
      
      updatedItems = currentItems.map((existing, index) => 
        index === existingItemIndex 
          ? { ...existing, cantidad: newQuantity, subtotal: newSubtotal }
          : existing
      );
      console.log('🔄 Item actualizado, nueva cantidad:', newQuantity);
    } else {
      // Agregar nuevo item
      const newItem = { 
        ...item, 
        subtotal: this.calculateSubtotal(item.variacion.producto.precio, item.cantidad) 
      };
      updatedItems = [...currentItems, newItem];
      console.log('➕ Nuevo item agregado');
    }

    this.itemsSubject.next(updatedItems);
    this.saveCartToStorage();
    
    console.log('🛒 Carrito actualizado. Total items:', updatedItems.length);
  }

  removeItem(itemId: string) {
    if (!this.shouldHaveCart()) {
      return;
    }

    console.log('🗑️ Removiendo item del carrito:', itemId);
    const currentItems = this.itemsSubject.value;
    const updatedItems = currentItems.filter(item => item.id !== itemId);
    this.itemsSubject.next(updatedItems);
    this.saveCartToStorage();
  }

  updateItemQuantity(itemId: string, newQuantity: number) {
    if (!this.shouldHaveCart()) {
      return;
    }

    if (newQuantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    console.log('🔢 Actualizando cantidad de item:', itemId, 'nueva cantidad:', newQuantity);
    const currentItems = this.itemsSubject.value;
    const updatedItems = currentItems.map(item => 
      item.id === itemId 
        ? { ...item, cantidad: newQuantity, subtotal: this.calculateSubtotal(item.variacion.producto.precio, newQuantity) }
        : item
    );
    
    this.itemsSubject.next(updatedItems);
    this.saveCartToStorage();
  }

  clearCart() {
    if (!this.shouldHaveCart()) {
      return;
    }

    console.log('🧹 Limpiando carrito');
    this.itemsSubject.next([]);
    const storageKey = this.getStorageKey();
    localStorage.removeItem(storageKey);
  }

  private calculateSubtotal(price: number, quantity: number): number {
    return price * quantity;
  }

  getCurrentItems(): ItemCarrito[] {
    return this.shouldHaveCart() ? this.itemsSubject.value : [];
  }

  getCartData() {
    const items = this.itemsSubject.value;
    return {
      items: items,
      total: items.reduce((sum, item) => sum + item.subtotal, 0),
      totalItems: items.reduce((sum, item) => sum + item.cantidad, 0)
    };
  }

  clearUserCart(userId: string) {
    if (this.isAdmin()) {
      const userCartKey = `${this.STORAGE_KEY}_${userId}`;
      localStorage.removeItem(userCartKey);
    }
  }

  // ✅ Método para migrar carrito anónimo a usuario autenticado
  migrateAnonymousCartToUser() {
    try {
      const anonymousId = this.getOrCreateAnonymousId();
      const authenticatedUserId = this.keycloakService.getUserId();
      
      if (authenticatedUserId && anonymousId !== authenticatedUserId) {
        const anonymousCartKey = `${this.STORAGE_KEY}_${anonymousId}`;
        const userCartKey = `${this.STORAGE_KEY}_${authenticatedUserId}`;
        
        const anonymousCart = localStorage.getItem(anonymousCartKey);
        const userCart = localStorage.getItem(userCartKey);
        
        if (anonymousCart && !userCart) {
          // Migrar carrito anónimo al usuario autenticado
          localStorage.setItem(userCartKey, anonymousCart);
          localStorage.removeItem(anonymousCartKey);
          console.log('🔄 Carrito migrado de anónimo a usuario autenticado');
          
          // Recargar carrito
          this.loadCartFromStorage();
        }
      }
    } catch (error) {
      console.error('❌ Error migrando carrito:', error);
    }
  }
}