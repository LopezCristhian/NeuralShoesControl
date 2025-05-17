import { Routes } from '@angular/router';
import { IndexComponent } from './domains/index/index/index.component';
import { ProductComponent } from './domains/products/product/product.component';

export const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'productos', component: ProductComponent }
];