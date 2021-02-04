import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';
import { AuthServices } from './common/services/auth.service';
import { NgIdleModule } from '@ng-idle/core'
import { JwtHelperService, JWT_OPTIONS, JwtModule  } from '@auth0/angular-jwt';
import { SocialLoginModule } from 'angularx-social-login';
import { SocialAuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider  } from 'angularx-social-login';
import { NgSelectModule } from '@ng-select/ng-select';
import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import { QRCodeModule } from 'angularx-qrcode';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { CommonModule } from '@angular/common';
import { NotificationService } from './common/services/notification.service';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginLayoutComponent } from './layouts/login-layout/login-layout.component';
import { NotificationComponent } from './notification/notification.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { LoginPetsComponent } from './login/login-pets/login-pets.component';
import { RegisterPetComponent } from './register/register-pets/register-pets.component';
import { ForgotCompanyComponent } from './forgot/forgot-company/forgot-company.component';
import { ForgotUserComponent } from './forgot/forgot-user/forgot-user.component';
import { ResetCompanyComponent } from './reset/reset-company/reset-company.component';
import { ResetUserComponent } from './reset/reset-user/reset-user.component';

import { NotFoundComponent } from './not-found/not-found.component';

import { DashboardUserComponent } from './dashboard/dashboard-user/dashboard-user.component';
import { DashboardCompanyComponent } from './dashboard/dashboard-company/dashboard-company.component';
import { ProfileCompanyComponent } from './profile/profile-company/profile-company.component';
import { ProfileUserComponent } from './profile/profile-user/profile-user.component';
import { AdminMasterComponent } from './admin-master/admin-master.component';
import { MapComponent } from './map/map.component';
import { MenusComponent } from './menus/menus.component';
import { DashboardPetComponent } from './dashboard/dashboard-pet/dashboard-pet.component';
import { MyPetCodeComponent } from './my-pet-code/my-pet-code.component';
import { SwitchComponent } from './common/directives/switch/switch.component';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';

export function tokenGetter() {
  return localStorage.getItem("id_token");
}

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin
]);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MainLayoutComponent,
    LoginLayoutComponent,
    NotificationComponent,
    ToolbarComponent,
    LoginPetsComponent,
    RegisterPetComponent,
    ForgotCompanyComponent,
    ForgotUserComponent,
    ResetCompanyComponent,
    ResetUserComponent,
    NotFoundComponent,
    DashboardUserComponent,
    DashboardCompanyComponent,
    ProfileCompanyComponent,
    ProfileUserComponent,
    AdminMasterComponent,
    MapComponent,
    MenusComponent,
    DashboardPetComponent,
    MyPetCodeComponent,
    SwitchComponent,
    ShoppingCartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    CommonModule,
    SocialLoginModule,
    FullCalendarModule,
    QRCodeModule,
    NgIdleModule.forRoot(),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ["localhos:8080","foo.com", "bar.com"],
      },
    }),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyC6XvMo8SNV30Pylr97UwPP6EPi1LGn_9A',
      libraries: ['places','geometry','weather']
    }),
    AgmDirectionModule
  ],
  providers: [NotificationService,AuthServices, {
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: false,
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(
            '637451349426-cboh4fm1lruorkdbhgr75jb584r05b8n.apps.googleusercontent.com'
          )
        },
        {
          id: FacebookLoginProvider.PROVIDER_ID,
          provider: new FacebookLoginProvider('427713864913309')
        }
      ]
    } as SocialAuthServiceConfig,
  }],
  bootstrap: [AppComponent]

  //AIzaSyC6XvMo8SNV30Pylr97UwPP6EPi1LGn_9A   key para google maps
})
export class AppModule { }
