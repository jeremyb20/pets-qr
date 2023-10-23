import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginLayoutComponent } from './layouts/login-layout/login-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginPetsComponent } from './login/login-pets.component';
import { RegisterPetComponent } from './register/register-pets.component';

import { NotFoundComponent } from './not-found/not-found.component';
import { AdminGuard } from  './common/admin/admin.guard';

import { AdminMasterComponent } from './admin-master/admin-master.component';
import { DashboardPetComponent } from './dashboard/dashboard-pet.component';
import { MyPetCodeComponent } from './my-pet-code/my-pet-code.component';
import { SearchLostComponent } from './search-lost/search-lost.component';
import { ForgotPetsComponent } from './forgot/forgot-pets.component';
import { ResetPetsComponent } from './reset/reset-pets.component';
import { ProfilePetsComponent } from './profile/profile-pets.component';
import { EventsPetsComponent } from './events/events-pets/events-pets.component';
import { LocationPetsComponent } from './location/location-pets.component';
import { PermissionsPetsComponent } from './permissions/permissions-pets.component';
import { PetsOrdersComponent } from './admin-master/pets-orders/pets-orders.component';
import { PetsRegisteredComponent } from './admin-master/pets-registered/pets-registered.component';
import { NewQRPetsComponent } from './admin-master/new-qrpets/new-qrpets.component';
import { CatalogComponent } from './catalog/catalog.component';
import { PetsProductsComponent } from './admin-master/pets-products/pets-products.component';


const routes: Routes = [
  { 
      path: '', 
      component: LoginLayoutComponent, 
      children: [
          { path: '', redirectTo: 'home',  pathMatch: 'full' }, 
          { path: 'home', component: HomeComponent },
          { path: 'login-pets', component: LoginPetsComponent },
          { path: 'register-pets/:id/:idSecond/:isActivated', component: RegisterPetComponent },
          { path: 'forgot-pets', component: ForgotPetsComponent },
          { path: 'search-lost', component: SearchLostComponent },
          { path: 'reset-pets/:token', component: ResetPetsComponent },
          { path: 'myPetCode/:id/:idSecond', component: MyPetCodeComponent },
          { path: 'catalog', component: CatalogComponent }

          // { path: 'maintenance', component: MaintenanceComponent },
      ]
  },
  { 
      path: '',
      component: MainLayoutComponent, 
      children: [    
        { path: 'admin', component: AdminMasterComponent },        
        { path: 'dashboard-pet', component: DashboardPetComponent,canActivate: [AdminGuard] },
        { path: 'myPetCode', component: MyPetCodeComponent },
        { path: 'register-pets', component: RegisterPetComponent },
        { path: 'pets-orders', component: PetsOrdersComponent, canActivate: [AdminGuard]},
        { path: 'pets-registered', component: PetsRegisteredComponent, canActivate: [AdminGuard]},
        { path: 'pets-qrgenerator', component: NewQRPetsComponent, canActivate: [AdminGuard]},
        { path: 'pets-products', component: PetsProductsComponent, canActivate: [AdminGuard]},
        { path: 'profile-pets', component: ProfilePetsComponent ,canActivate: [AdminGuard]},
        { path: 'events-pets', component: EventsPetsComponent ,canActivate: [AdminGuard]},
        { path: 'location-pets', component: LocationPetsComponent ,canActivate: [AdminGuard]},
        { path: 'permissions-pets', component: PermissionsPetsComponent ,canActivate: [AdminGuard]},
        { path: '404', component: NotFoundComponent},
        { path: '**', redirectTo: '/404' }

      ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
