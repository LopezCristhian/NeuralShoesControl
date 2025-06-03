// // token.interceptor.ts
// import { Injectable } from '@angular/core';
// import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
// import { KeycloakService } from '../services/keycloak.service';

// @Injectable()
// export class TokenInterceptor implements HttpInterceptor {
//   constructor(private keycloak: KeycloakService) {}

//   intercept(req: HttpRequest<any>, next: HttpHandler) {
//     const token = this.keycloak.getToken();
//     const headers = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//     return next.handle(headers);
//   }
// }


import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KeycloakService } from '../services/keycloak.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private keycloak: KeycloakService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.keycloak.getToken();

    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authReq);
    }

    // No se agrega Authorization si no hay token (para vistas públicas)
    return next.handle(req);
  }
}
