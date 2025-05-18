import { Routes } from '@angular/router';
import { IndexComponent } from './domains/index/index/index.component';
import { ProductComponent } from './domains/products/product/product.component';
import { AdminDemoComponent } from './admin-demo/admin-demo.component';
import { CategoryComponent } from './domains/categories/category/category.component';
import { BrandComponent } from './domains/brands/brand/brand.component';

export const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'productos', component: ProductComponent },
  { path: 'admin-demo', component: AdminDemoComponent },
  { path: 'categorias', component: CategoryComponent },
  { path: 'marcas', component: BrandComponent }
];