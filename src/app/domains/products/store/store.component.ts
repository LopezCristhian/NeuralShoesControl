import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Agrega esto
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { CartStateService } from '../../../services/cart-state.service';
import { ItemCarrito } from '../../../models/item_carrito.model';


type ProductWithActiveImg = Product & { activeImgIndex: number };

interface PreCartItem {
  producto: Product;
  colorId: string;
  colorNombre: string;
  tallaId: string;
  tallaNumero: string;
  cantidad: number;
}

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule] // <-- Agrega FormsModule aquí
})
export class StoreComponent implements OnInit {
  products: ProductWithActiveImg[] = [];
  preCart: PreCartItem[] = [];

  // Modal
  showModal = false;
  selectedProduct: ProductWithActiveImg | null = null;
  selectedColorId = '';
  selectedTallaId = '';
  cantidad = 1;

  constructor(
    private productService: ProductService,
    private cartState: CartStateService
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => {
      this.products = data.map(p => ({ ...p, activeImgIndex: 0 }));
    });
  }

  prevImg(product: ProductWithActiveImg) {
    if (!product.imagenes?.length) return;
    product.activeImgIndex = (product.activeImgIndex > 0)
      ? product.activeImgIndex - 1
      : product.imagenes.length - 1;
  }

  nextImg(product: ProductWithActiveImg) {
    if (!product.imagenes?.length) return;
    product.activeImgIndex = (product.activeImgIndex + 1) % product.imagenes.length;
  }

  openModal(product: ProductWithActiveImg) {
    this.selectedProduct = product;
    this.selectedColorId = '';
    this.selectedTallaId = '';
    this.cantidad = 1;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedProduct = null;
    this.selectedColorId = '';
    this.selectedTallaId = '';
    this.cantidad = 1;
  }

  addPreCart() {
    if (!this.selectedProduct || !this.selectedColorId || !this.selectedTallaId || this.cantidad < 1) return;
    const color = this.selectedProduct.colores.find(c => c.id === this.selectedColorId);
    const talla = this.selectedProduct.tallas.find(t => t.id === this.selectedTallaId);
    // Evitar duplicados exactos
    const exists = this.preCart.find(item =>
      item.producto.id === this.selectedProduct!.id &&
      item.colorId === this.selectedColorId &&
      item.tallaId === this.selectedTallaId
    );
    if (exists) {
      exists.cantidad += this.cantidad;
    } else {
      this.preCart.push({
        producto: this.selectedProduct,
        colorId: this.selectedColorId,
        colorNombre: color?.nombre || '',
        tallaId: this.selectedTallaId,
        tallaNumero: talla?.numero || '',
        cantidad: this.cantidad
      });
    }
    this.closeModal();
  }

  removePreCart(item: PreCartItem) {
    this.preCart = this.preCart.filter(i => i !== item);
  }

  getPreCartTotal() {
    return this.preCart.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
  }

  // Confirmar productos y actualizar el carrito global
  confirmarCarrito() {
    // Transforma los preCart a ItemCarrito (puedes adaptar según tu modelo real)
    const items: ItemCarrito[] = this.preCart.map(item => ({
      id: '', // El backend lo asignará si lo necesitas
      carrito: '', // Puedes asignar el id del carrito si lo tienes
      variacion: {
        id: '', // Si tienes el id de la variación, úsalo
        producto: item.producto,
        talla: { id: item.tallaId, numero: item.tallaNumero },
        color: { id: item.colorId, nombre: item.colorNombre },
        stock: 0 // No relevante aquí
      },
      cantidad: item.cantidad,
      subtotal: item.producto.precio * item.cantidad
    }));
    this.cartState.setItems(items);
    this.preCart = [];
  }
}