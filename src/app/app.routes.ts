import { Routes } from '@angular/router';
import { IndexComponent } from './domains/index/index/index.component';
import { ProductComponent } from './domains/products/product/product.component';
import { AdminDemoComponent } from './admin-demo/admin-demo.component';
import { CategoryComponent } from './domains/categories/category/category.component';
import { BrandComponent } from './domains/brands/brand/brand.component';
import { StoreComponent } from './domains/products/store/store.component';
import { authRoleGuard } from './guards/auth.guard';
import { CartComponent } from './domains/products/cart/cart.component';


export const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'productos', component: ProductComponent, canActivate: [authRoleGuard], data: { roles: ['administrator'] } },
  { path: 'admin-demo', component: AdminDemoComponent },
  { path: 'categorias', component: CategoryComponent, canActivate: [authRoleGuard], data: { roles: ['administrator'] } },
  { path: 'marcas', component: BrandComponent, canActivate: [authRoleGuard], data: { roles: ['administrator'] } },
  { path: 'tienda', component: StoreComponent},// canActivate: [authGuard] },
  { path: 'administracion', component: IndexComponent, canActivate: [authRoleGuard], data: { roles: ['administrator'] } },
  { path: 'carrito', component: CartComponent }

];