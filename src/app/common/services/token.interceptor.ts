import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NotificationService } from './notification.service';
@Injectable({
    providedIn: 'root'
})
export class TokenInterceptor implements HttpInterceptor {
  clonedReq: any;
  constructor(private _cookieService: CookieService, private _notificationService: NotificationService, private _route: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>  {
    if (localStorage.getItem('token') != null) {
      localStorage.setItem('token', localStorage.getItem('token')!);
      this.clonedReq = request.clone({
        headers: request.headers.set('Authorization', 'Token ' + localStorage.getItem('token')!)
      });

      return next.handle(this.clonedReq).pipe(
        tap(
          {
            next: (result: any) => {
              //console.log(result); //magic should work
            },
            error: (error) => {
              if (error.status == 401) {
                this._notificationService.warning('Hola ', 'Token ha expirado, inicie sesion nuevamente', 6000);

                this._route.navigate(['/login']);

              }
            }
          }
        )
      )
    }else{
      this._route.navigate(['/login']);
      return next.handle(request.clone())
    }

  }
}
