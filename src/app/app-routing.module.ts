import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginLayoutComponent } from './layouts/login-layout/login-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginPetsComponent } from './login/login-pets/login-pets.component';
import { RegisterPetComponent } from './register/register-pets/register-pets.component';
import { ForgotCompanyComponent } from './forgot/forgot-company/forgot-company.component';
import { ForgotUserComponent } from './forgot/forgot-user/forgot-user.component';
import { ResetCompanyComponent } from './reset/reset-company/reset-company.component';
import { ResetUserComponent } from './reset/reset-user/reset-user.component';

import { NotFoundComponent } from './not-found/not-found.component';
import { AdminGuard } from  './common/admin/admin.guard';

import { DashboardUserComponent } from './dashboard/dashboard-user/dashboard-user.component';
import { DashboardCompanyComponent } from './dashboard/dashboard-company/dashboard-company.component';
import { ProfileUserComponent } from './profile/profile-user/profile-user.component';
import { ProfileCompanyComponent } from './profile/profile-company/profile-company.component';
import { AdminMasterComponent } from './admin-master/admin-master.component';
import { MapComponent } from './map/map.component';
import { MenusComponent } from './menus/menus.component';
import { DashboardPetComponent } from './dashboard/dashboard-pet/dashboard-pet.component';
import { MyPetCodeComponent } from './my-pet-code/my-pet-code.component';


const routes: Routes = [
  { 
      path: '', 
      component: LoginLayoutComponent, 
      children: [
          { path: '', redirectTo: 'home',  pathMatch: 'full' }, 
          { path: 'home', component: HomeComponent },
          { path: 'login-pets', component: LoginPetsComponent },
          { path: 'register-pets', component: RegisterPetComponent },
          { path: 'forgot-company', component: ForgotCompanyComponent },
          { path: 'forgot-user', component: ForgotUserComponent },
          { path: 'reset-company/:token', component: ResetCompanyComponent },
          { path: 'reset-user/:token', component: ResetUserComponent },
          { path: 'myPetCode/:id', component: MyPetCodeComponent },

          // { path: 'maintenance', component: MaintenanceComponent },
      ]
  },
  { 
      path: '',
      component: MainLayoutComponent, 
      children: [    
        { path: 'admin', component: AdminMasterComponent },        
        { path: 'dashboard-user', component: DashboardUserComponent,canActivate: [AdminGuard] },
        { path: 'dashboard-company', component: DashboardCompanyComponent,canActivate: [AdminGuard] },
        { path: 'dashboard-pet', component: DashboardPetComponent,canActivate: [AdminGuard] },

      
        { path: 'profile-user', component: ProfileUserComponent ,canActivate: [AdminGuard]},
        { path: 'profile-company', component: ProfileCompanyComponent ,canActivate: [AdminGuard]},
        { path: 'dashboard-user-map', component: MapComponent ,canActivate: [AdminGuard]},
        { path: 'dashboard-user-menus', component: MenusComponent ,canActivate: [AdminGuard]},
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
