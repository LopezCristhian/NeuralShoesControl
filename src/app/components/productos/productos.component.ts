import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';

import {Product} from '../../models/product.model';

import { ProductPublicService } from 'app/services/public-product.service'; 

@Component({
  selector: 'app-producto-lista',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductoListaComponent implements OnInit {
  productos: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => {
      this.productos = data;
    });
  }
}
