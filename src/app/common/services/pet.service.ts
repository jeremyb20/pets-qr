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
    fd.append('petStatus',pet.petStatus);

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
    fd.append('linkTwitter',pet.linkTwitter);
    fd.append('linkFacebook',pet.linkFacebook);
    fd.append('linkInstagram',pet.linkInstagram);

    if(this.isDev) {
      return this.httpClient.put<any>('http://localhost:8080/pet/update/updateProfilePet', fd);
    }else{
      return this.httpClient.put<any>('pet/update/updateProfilePet', fd);
    }
  }

  updatePetLocation(market):Observable<any> { 
    const fd = new FormData();
    fd.append('lat',market.lat);
    fd.append('lng',market.lng);
    fd.append('_id',market._id);
    if(this.isDev) {
      return this.httpClient.put<any>('http://localhost:8080/pet/update/updateLocationPet', fd);
    }else{
      return this.httpClient.put<any>('pet/update/updateLocationPet', fd);
    }
  }

  updatePhotoPetProfile(id:any, photo:any):Observable<any> { 
    const fd = new FormData();
    fd.append('image', photo);
    fd.append('_id', id);

    if(this.isDev) {
      return this.httpClient.put<any>('http://localhost:8080/pet/update/updatePhotoPetProfile', fd);
    }else{
      return this.httpClient.put<any>('pet/update/updatePhotoPetProfile', fd);
    }
  }


  registerNewPetEvent(event):Observable<any> {
    const fd = new FormData();
    fd.append('title',event.title);
    fd.append('date',event.date);
    fd.append('enddate',event.enddate);
    fd.append('description',event.description);
    fd.append('_id',event._id);

    if(this.isDev) {
      return this.httpClient.post<any>('http://localhost:8080/pet/register/newPetEvent', fd);
    }else{
      return this.httpClient.post<any>('pet/register/newPetEvent', fd);
    }
  }

  sendNewPetStatusEvent(event, status):Observable<any> {
    const fd = new FormData();
    fd.append('lastPlaceLost',event.lastPlaceLost);
    fd.append('date',event.date);
    fd.append('petStatus',status.petStatus);
    fd.append('petName',status.petName);
    fd.append('descriptionLost',event.descriptionLost);
    fd.append('_id',event._id);

    if(this.isDev) {
      return this.httpClient.post<any>('http://localhost:8080/pet/report/reportLostPetStatus', fd);
    }else{
      return this.httpClient.post<any>('pet/report/reportLostPetStatus', fd);
    }
  }

  updatePetStatusReport(status:any):Observable<any> { 
    const fd = new FormData();
    fd.append('petStatus',status.petStatus);
    fd.append('petName',status.petName);
    fd.append('_id', status._id);

    if(this.isDev) {
      return this.httpClient.put<any>('http://localhost:8080/pet/update/updateReportLostPetStatus', fd);
    }else{
      return this.httpClient.put<any>('pet/update/updateReportLostPetStatus', fd);
    }
  }

  generateQrCodePet(obj: any):Observable<any> {
    const fd = new FormData();
    fd.append('_id', obj.id);
    fd.append('status', obj.status);
    fd.append('petName', obj.petName);
    fd.append('photo', obj.photo);
    if(this.isDev) {
      return this.httpClient.post<any>('http://localhost:8080/pet/register/generateQrCodePet', fd);
    }else{
      return this.httpClient.post<any>('pet/register/generateQrCodePet', fd);
    }
  }
  
  updateStatusCodePet(obj: any):Observable<any> {
    const fd = new FormData();
    fd.append('_id', obj.id);
    fd.append('status', obj.status);
    fd.append('photo', obj.photo);
    if(this.isDev) {
      return this.httpClient.put<any>('http://localhost:8080/pet/update/updateStatusQrCodePet', fd);
    }else{
      return this.httpClient.put<any>('pet/update/updateStatusQrCodePet', fd);
    }
  }

  getPetDaList(id):Observable<any> {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    headers.append('Content-Type', 'application/json');
    if (this.isDev) {
      return this.httpClient.get<any>('http://localhost:8080/pet/getPetDataList/' + id);
    } else {
      return this.httpClient.get<any>('pet/getPetDataList/' + id);
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
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    headers.append('Content-Type', 'application/json');
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

  
  // Permissions
  
  getPetPermissionsDataList(id):Observable<any> {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    headers.append('Content-Type', 'application/json');
    if (this.isDev) {
      return this.httpClient.get<any>('http://localhost:8080/pet/getPermissionsData/' + id);
    } else {
      return this.httpClient.get<any>('pet/getPermissionsData/' + id);
    }
  }


  updatePetPermissionInfo(obj: any):Observable<any> {
    const fd = new FormData();
    fd.append('_id', obj.id);
    fd.append('showPhoneInfo', obj.showPhoneInfo)
    fd.append('showEmailInfo', obj.showEmailInfo)
    fd.append('showLinkTwitter', obj.showLinkTwitter)
    fd.append('showLinkFacebook', obj.showLinkFacebook)
    fd.append('showLinkInstagram', obj.showLinkInstagram)
    fd.append('showOwnerPetName', obj.showOwnerPetName)
    fd.append('showBirthDate', obj.showBirthDate)
    fd.append('showAddressInfo', obj.showAddressInfo)
    fd.append('showAgeInfo', obj.showAgeInfo)
    fd.append('showVeterinarianContact', obj.showVeterinarianContact)
    fd.append('showPhoneVeterinarian', obj.showPhoneVeterinarian)
    fd.append('showHealthAndRequirements', obj.showHealthAndRequirements)
    fd.append('showFavoriteActivities', obj.showFavoriteActivities)
    fd.append('showLocationInfo', obj.showLocationInfo)

    if(this.isDev) {
      return this.httpClient.put<any>('http://localhost:8080/pet/update/updatePetPermissions', fd);
    }else{
      return this.httpClient.put<any>('pet/update/updatePetPermissions', fd);
    }
  }

  // Permissions



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




// admin

getPetsList():Observable<any> {
  this.loadToken();
  if (this.isDev) {
    return this.httpClient.get<any>('http://localhost:8080/pet/admin/getAllPets/');
  } else {
    return this.httpClient.get<any>('pet/admin/getAllPets/');
  }
}

getPetsLostList():Observable<any> {
  this.loadToken();
  if (this.isDev) {
    return this.httpClient.get<any>('http://localhost:8080/pet/lost/getAllLostPets/');
  } else {
    return this.httpClient.get<any>('pet/lost/getAllLostPets/');
  }
}


getAdminDataList():Observable<any> {
  let headers = new Headers();
  this.loadToken();
  headers.append('Authorization', this.authToken);
  headers.append('Content-Type', 'application/json');
  if (this.isDev) {
    return this.httpClient.get<any>('http://localhost:8080/pet/admin/getAdminDataList');
  } else {
    return this.httpClient.get<any>('pet/admin/getAdminDataList');
  }
}

// admin


// Notifications

getNotificationsService(id):Observable<any> {
  let headers = new Headers();
  this.loadToken();
  headers.append('Authorization', this.authToken);
  headers.append('Content-Type', 'application/json');
  if (this.isDev) {
    return this.httpClient.get<any>('http://localhost:8080/pet/notifications/getNotificationsList/'+ id);
  } else {
    return this.httpClient.get<any>('pet/notificationsn/getNotificationsList/'+ id);
  }
}

updateNotification(obj: any):Observable<any> {
  const fd = new FormData();
  fd.append('_id', obj.id);
  fd.append('isNewMsg', obj.isNewMsg);
  fd.append('idItem', obj.idItem);
  if(this.isDev) {
    return this.httpClient.put<any>('http://localhost:8080/pet/update/updateNotificationsList', fd);
  }else{
    return this.httpClient.put<any>('pet/update/updateNotificationsList', fd);
  }
}


// Notifications


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