import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { GoogleMapsModule } from '@angular/google-maps'
import { AuthServices } from './common/services/auth.service';
import { JwtHelperService, JWT_OPTIONS, JwtModule  } from '@auth0/angular-jwt';
import { NgSelectModule } from '@ng-select/ng-select';
import { QRCodeModule } from 'angularx-qrcode';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { CommonModule } from '@angular/common';
import { NotificationService } from './common/services/notification.service';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginLayoutComponent } from './layouts/login-layout/login-layout.component';
import { NotificationComponent } from './notification/notification.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { LoginPetsComponent } from './login/login-pets.component';
import { RegisterPetComponent } from './register/register-pets.component';

import { NotFoundComponent } from './not-found/not-found.component';

import { AdminMasterComponent } from './admin-master/admin-master.component';
import { DashboardPetComponent } from './dashboard/dashboard-pet.component';
import { MyPetCodeComponent } from './my-pet-code/my-pet-code.component';
import { SwitchComponent } from './common/directives/switch/switch.component';
import { SearchLostComponent } from './search-lost/search-lost.component';
import { ForgotPetsComponent } from './forgot/forgot-pets.component';
import { ResetPetsComponent } from './reset/reset-pets.component';
import { ProfilePetsComponent } from './profile/profile-pets.component';
import { EventsPetsComponent } from './events/events-pets/events-pets.component';
import { LocationPetsComponent } from './location/location-pets.component';
import { PermissionsPetsComponent } from './permissions/permissions-pets.component';
import { PetsRegisteredComponent } from './admin-master/pets-registered/pets-registered.component';
import { PetsOrdersComponent } from './admin-master/pets-orders/pets-orders.component';
import { NewQRPetsComponent } from './admin-master/new-qrpets/new-qrpets.component';
import { CatalogComponent } from './catalog/catalog.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { TermAndConditionsComponent } from './term-and-conditions/term-and-conditions.component';
import { PetsProductsComponent } from './admin-master/pets-products/pets-products.component';
import { TokenInterceptor } from './common/services/token.interceptor';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


/**
  PRIME MODULES
*/ 

import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { SliderModule } from 'primeng/slider';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';


export function tokenGetter() {
  return localStorage.getItem("id_token");
}

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
    NotFoundComponent,
    AdminMasterComponent,
    DashboardPetComponent,
    MyPetCodeComponent,
    SwitchComponent,
    SearchLostComponent,
    ForgotPetsComponent,
    ResetPetsComponent,
    ProfilePetsComponent,
    EventsPetsComponent,
    LocationPetsComponent,
    PermissionsPetsComponent,
    PetsRegisteredComponent,
    PetsOrdersComponent,
    NewQRPetsComponent,
    CatalogComponent,
    TermAndConditionsComponent,
    PetsProductsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    CommonModule,
    QRCodeModule,
    BrowserAnimationsModule,
    NgbModule,
    TableModule,
    CalendarModule,
    SliderModule,
    DialogModule,
    MultiSelectModule,
    ContextMenuModule,
    DropdownModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputSwitchModule,
    ProgressBarModule,
    TabViewModule,
    CheckboxModule,
    FileUploadModule,
    InputNumberModule,
    TagModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter
      },
    }),
    GoogleMapsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    NotificationService,
    AuthServices,
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: TokenInterceptor,
    //   multi: true
    // }
  ],
  bootstrap: [AppComponent]

  //AIzaSyC6XvMo8SNV30Pylr97UwPP6EPi1LGn_9A   key para google maps
})
export class AppModule { }
