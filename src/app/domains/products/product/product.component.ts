import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../models/product.model';


@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProductComponent implements OnInit {
  //products: any[] = [];
  productDialog = false;
  productDialogTitle = '';
  //selectedProduct: any = {};
  products: Product[] = [];
  selectedProduct: Product = {} as Product;


  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

loadProducts() {
  this.productService.getProducts().subscribe((data: Product[]) => {
    this.products = data;
  });
}


  openNew() {
    this.selectedProduct = {} as Product;
    this.productDialogTitle = 'Agregar Producto';
    this.productDialog = true;
  }

  editProduct(product: any) {
    this.selectedProduct = { ...product };
    this.productDialogTitle = 'Editar Producto';
    this.productDialog = true;
  }

  hideDialog() {
    this.productDialog = false;
  }

  saveProduct() {
    if (this.selectedProduct.id) {
      const idx = this.products.findIndex(p => p.id === this.selectedProduct.id);
      if (idx > -1) this.products[idx] = { ...this.selectedProduct };
    } else {
      this.selectedProduct.id = Math.random().toString(36).substring(2, 9);
      this.products.push({ ...this.selectedProduct });
    }
    this.productDialog = false;
  }

  deleteProduct(product: Product) {
    this.products = this.products.filter(p => p.id !== product.id);
  }
  
}