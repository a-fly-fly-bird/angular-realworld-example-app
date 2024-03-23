import { APP_INITIALIZER, ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";

import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { EMPTY } from "rxjs";
import { routes } from "./app.routes";
import { JwtService } from "./core/auth/services/jwt.service";
import { UserService } from "./core/auth/services/user.service";
import { apiInterceptor } from "./core/interceptors/api.interceptor";
import { errorInterceptor } from "./core/interceptors/error.interceptor";
import { tokenInterceptor } from "./core/interceptors/token.interceptor";

export function initAuth(jwtService: JwtService, userService: UserService) {
  return () => (jwtService.getToken() ? userService.getCurrentUser() : EMPTY);
}

export const appConfig: ApplicationConfig = {
  providers: [
    /**
     *    这里的写法也是很不一样，老的写法是有一个AppRoutingModule文件，
          import { NgModule } from '@angular/core';
          import { RouterModule, Routes } from '@angular/router';

          const routes: Routes = [
          {
            ...
          },
          {
            ...
          }
          ];

          @NgModule({
            imports: [RouterModule.forRoot(routes)],
            exports: [RouterModule]
          })
          export class AppRoutingModule { }

          可以看到Angular全面取代ngModule的决心
     */

    provideRouter(routes),
    provideHttpClient(
      withInterceptors([apiInterceptor, tokenInterceptor, errorInterceptor]),
    ),
    {
      // https://angular.io/api/core/APP_INITIALIZER
      provide: APP_INITIALIZER,
      // 在应用初始化的时候，会注入对应的工厂函数执行，也就是initAuth, initAuth 会调用getToken()方法检查本地是否缓存有JWT Token,有的话就会发送一个http请求，http请求首先会走apiInterceptor，然后是tokenInterceptor，tokenInterceptor里面有会再调一次getToken()方法，表示是哪个用户在请求验证（可以验证是否过期等等）（getCurrentUser方法加了shareReplay，所以只会调用一次，后面直接返回结果。如果getToken()没有获取到Token的话，就不会调用getCurrentUser（）方法，也就不会this.currentUserSubject.next(user)，也就是说没有用户数据。访问网站，可以看到行为是默认进入首页，但是没有登陆。）
      useFactory: initAuth,
      deps: [JwtService, UserService],
      // https://stackoverflow.com/a/38144889/23382462. multi代表不是override该类型的provider，而是加入到这个provider中，不会覆盖已有的。
      multi: true,
    },
  ],
};
