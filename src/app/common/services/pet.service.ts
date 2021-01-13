import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

@Injectable()
export class PetService {
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  authToken: any;
  pet: any;
  isDev: boolean = false;

  constructor(private httpClient: HttpClient, private jwtHelper: JwtHelperService) {
      this.isDev = true;  // Change to false when you're gonna deploy your app, true when is on develop 
  }

  registerPet(pet,  photo:any):Observable<any> {
    const fd = new FormData();
    fd.append('petName',pet.petName);
    fd.append('username',pet.username);
    fd.append('phone',pet.phone);
    fd.append('userState',pet.userState);
    fd.append('email',pet.email);
    fd.append('password',pet.password);
    fd.append('lat',pet.lat);
    fd.append('lng',pet.lng);
    fd.append('bussinesSelected',pet.bussinesSelected);
    fd.append('image', photo);

    if(this.isDev) {
      return this.httpClient.post<any>('http://localhost:8080/pet/register/new-pet', fd);
    }else{
      return this.httpClient.post<any>('pet/register/new-pet', fd);
    }
  }

  authenticatePet(pet:any): Observable<any> {
    if(this.isDev){
      return this.httpClient.post('http://localhost:8080/pet/authenticate', pet, { headers: this.headers});
    }else{
      return this.httpClient.post('pet/authenticate', pet, { headers: this.headers});
    }
  }


  updatePetProfile(pet):Observable<any> { 
    const fd = new FormData();
    fd.append('petName',pet.petName);
    fd.append('ownerPetName',pet.ownerPetName);
    fd.append('birthDate',pet.birthDate);
    fd.append('address',pet.address);
    fd.append('_id',pet._id);
    fd.append('email',pet.email);
    fd.append('age',pet.age);
    fd.append('veterinarianContact',pet.veterinarianContact);
    fd.append('phoneVeterinarian',pet.phoneVeterinarian);
    fd.append('healthAndRequirements',pet.healthAndRequirements);
    fd.append('favoriteActivities',pet.favoriteActivities);

    if(this.isDev) {
      return this.httpClient.put<any>('http://localhost:8080/pet/update/updateProfilePet', fd);
    }else{
      return this.httpClient.put<any>('pet/update/updateProfilePet', fd);
    }
  }




  registerNewMenu(menu,  photo:any):Observable<any> {
    const fd = new FormData();
    fd.append('foodName',menu.foodName);
    fd.append('description',menu.description);
    fd.append('cost',menu.cost);
    fd.append('idCompany',menu.idCompany);
    fd.append('image', photo);

    if(this.isDev) {
      return this.httpClient.post<any>('http://localhost:8080/company/register/newMenu', fd);
    }else{
      return this.httpClient.post<any>('company/register/newMenu', fd);
    }
  }

  getMyMenuList(id):Observable<any> {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    headers.append('Content-Type', 'application/json');
    if (this.isDev) {
      return this.httpClient.get<any>('http://localhost:8080/company/getAllMenuList/' + id);
    } else {
      return this.httpClient.get<any>('company/getAllMenuList/' + id);
    }
  }

  getCompanyMenuList(id):Observable<any> {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    headers.append('Content-Type', 'application/json');
    if (this.isDev) {
      return this.httpClient.get<any>('http://localhost:8080/company/getCompanyMenu/' + id);
    } else {
      return this.httpClient.get<any>('company/getCompanyMenu/' + id);
    }
  }

  updateNewMenu(menu, photo:any):Observable<any> { 
    const fd = new FormData();
    fd.append('foodName',menu.foodName);
    fd.append('description',menu.description);
    fd.append('cost',menu.cost);
    fd.append('_id',menu._id);
    fd.append('idCompany',menu.idCompany);
    fd.append('image', photo);

    if(this.isDev) {
      return this.httpClient.put<any>('http://localhost:8080/company/update/updateMenuItemList', fd);
    }else{
      return this.httpClient.put<any>('company/update/updateMenuItemList', fd);
    }
  }

  deleteMenuItem(item:any):Observable<any> {
    const fd = new FormData();
    fd.append('_id',item._id);
    fd.append('idCompany',item.idCompany);
    if(this.isDev) {
      return this.httpClient.put<any>('http://localhost:8080/company/delete/deleteMenuItemList',fd);
    }else{
      return this.httpClient.put<any>('company/delete/deleteMenuItemList',fd);
    }
  }


  forgotPassword(email):Observable<any> {
    const fd = new FormData();
    fd.append('email',email.email);
    if (this.isDev) {
      return this.httpClient.post<any>('http://localhost:8080/company/forgot', fd);
    } else {
      return this.httpClient.post<any>('company/forgot/', fd);
    }
  }

  resetPassword(reset):Observable<any> {
    if (this.isDev) {
      return this.httpClient.post<any>('http://localhost:8080/company/reset/', reset);
    } else {
      return this.httpClient.post<any>('company/reset', reset);
    }
  }

  getRestaurantMenuList():Observable<any> {
    this.loadToken();
    if (this.isDev) {
      return this.httpClient.get<any>('http://localhost:8080/company/getRestaurantMenuList/');
    } else {
      return this.httpClient.get<any>('company/getRestaurantMenuList/');
    }
  }

//   getUsers() {
//     let headers = new Headers();
//     this.loadToken();
//     headers.append('Authorization', this.authToken);
//     headers.append('Content-Type', 'application/json');
//     if(this.isDev){
//       return this.http.get('http://localhost:8080/users/profile/getAllUsers', {headers: headers}).map(res => res.json());
//     }else{
//       return this.http.get('users/profile/getAllUsers', {headers: headers}).map(res => res.json());
//     }
//   }

//   updateUsers(user) { 
//     let headers = new Headers();
//     headers.append('Authorization', this.authToken);
//     headers.append('Content-Type', 'application/json');
//     const token = localStorage.getItem('id_token');
//     this.authToken = token;
//     this.storeUserData(token,user);
//     if(this.isDev){
//       return this.http.put('http://localhost:8080/users/profile/updateUsers', user, {headers: headers}).map(res => res.json());
//     }else{
//       return this.http.put('users/profile/updateUsers', user, {headers: headers}).map(res => res.json());
//     }
//   }

//   getProfile() {
//     let headers = new Headers();
//     this.loadToken();
//     headers.append('Authorization', this.authToken);
//     headers.append('Content-Type', 'application/json');
//     if(this.isDev){
//       return this.http.get('http://localhost:8080/users/profile', {headers: headers}).map(res => res.json());
//     }else{
//       return this.http.get('users/profile', {headers: headers}).map(res => res.json());
//     }
//   }

//   getSettings() {
//     let headers = new Headers();
//     this.loadToken();
//     headers.append('Authorization', this.authToken);
//     headers.append('Content-Type', 'application/json');
//     if(this.isDev){
//       return this.http.get('http://localhost:8080/users/settings', {headers: headers}).map(res => res.json());
//     }else{
//       return this.http.get('users/settings', {headers: headers}).map(res => res.json());
//     }
//   }

//   getUserMessages(id) {
//     let headers = new Headers();
//     this.loadToken();
//     headers.append('Authorization', this.authToken);
//     headers.append('Content-Type', 'application/json');
//     if(this.isDev){
//       return this.http.get('http://localhost:8080/users/mailbox/getMessages/' + id, {headers: headers}).map(res => res.json());
//     }else{
//       return this.http.get('users/mailbox/getMessages/' + id, {headers: headers}).map(res => res.json());
//     }
//   }

//   //New message 

//   sendMessage(message) {
//     let headers = new Headers();
//     headers.append('Content-Type', 'application/json');
//     if(this.isDev) {
//       return this.http.post('http://localhost:8080/users/mailbox/sendMessage', message, {headers: headers}).map(res => res.json());
//     }else{
//       return this.http.post('users/mailbox/sendMessage', message, {headers: headers}).map(res => res.json());
//     }
//   }

//   forgotPassword(email) {
//     let headers = new Headers();
//     headers.append('Content-Type', 'application/json');
//     if(this.isDev) {
//       return this.http.post('http://localhost:8080/users/forgot', email, {headers: headers}).map(res => res.json());
//     }else{
//       return this.http.post('users/forgot', email, {headers: headers}).map(res => res.json());
//     }
//   }

//   resetPassword(reset) {
//     let headers = new Headers();
//     headers.append('Content-Type', 'application/json');
//     if(this.isDev) {
//       return this.http.post('http://localhost:8080/users/reset/', reset,  {headers: headers}).map(res => res.json());
//     }else{
//       return this.http.post('users/reset', reset, {headers: headers}).map(res => res.json());
//     }
//   }

  storeUserData(token, pet) {
    localStorage.setItem('id_token', token);
    localStorage.setItem('pet', JSON.stringify(pet));
    this.authToken = token;
    this.pet = pet;
  }

  getLocalPet(){
    return localStorage.getItem("pet");
  }

  loadToken() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  loggedIn() {
    const token: string = localStorage.getItem('id_token');
    return token != null && !this.jwtHelper.isTokenExpired(token);
  }

  logout() {
    this.authToken = null;
    this.pet = null;
    localStorage.clear();
  }
}