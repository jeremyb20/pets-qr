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
    'Cache-Control': 'no-cache'
  });

  authToken: any;
  pet: any;
  petPrincipal: any;
  isDev: boolean = false;

  constructor(private httpClient: HttpClient, private jwtHelper: JwtHelperService) {
      this.isDev = false;  // Change to false when you're gonna deploy your app, true when is on develop 
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
    fd.append('genderSelected',pet.genderSelected);

    if(this.isDev) {
      return this.httpClient.post<any>('http://localhost:8080/pet/register/new-pet', fd);
    }else{
      return this.httpClient.post<any>('pet/register/new-pet', fd);
    }
  }

  registerNewPetByUserPet(pet,  photo:any):Observable<any> {
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
    fd.append('userState',pet.userState);
    fd.append('genderSelected',pet.genderSelected);
    fd.append('phone',pet.phone);
    // fd.append('linkTwitter',pet.linkTwitter);
    // fd.append('linkFacebook',pet.linkFacebook);
    // fd.append('linkInstagram',pet.linkInstagram);
    fd.append('petStatus',pet.petStatus);
    fd.append('lat',pet.lat);
    fd.append('lng',pet.lng);
    fd.append('image', photo);

    if(this.isDev) {
      return this.httpClient.post<any>('http://localhost:8080/pet/register/new-petByUserPet', fd);
    }else{
      return this.httpClient.post<any>('pet/register/new-petByUserPet', fd);
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
    fd.append('idSecond',pet.idSecond);
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
    fd.append('idSecond',market.idSecond);
    if(this.isDev) {
      return this.httpClient.put<any>('http://localhost:8080/pet/update/updateLocationPet', fd);
    }else{
      return this.httpClient.put<any>('pet/update/updateLocationPet', fd);
    }
  }

  updatePhotoPetProfile(id:any, idSecond: any, photo:any):Observable<any> { 
    const fd = new FormData();
    fd.append('image', photo);
    fd.append('idSecond',idSecond);
    fd.append('_id', id);

    if(this.isDev) {
      return this.httpClient.put<any>('http://localhost:8080/pet/update/updatePhotoPetProfile', fd);
    }else{
      return this.httpClient.put<any>('pet/update/updatePhotoPetProfile', fd);
    }
  }

  getCalendarInfoService(id: any, idSecondary: any):Observable<any> {
    if (this.isDev) {
      return this.httpClient.get<any>('http://localhost:8080/pet/getCalendarData/' + id +'/'+ idSecondary);
    } else {
      return this.httpClient.get<any>('pet/getCalendarData/' + id +'/'+ idSecondary);
    }
  }


  registerNewPetEvent(event):Observable<any> {
    const fd = new FormData();
    fd.append('title',event.title);
    fd.append('date',event.date);
    fd.append('enddate',event.enddate);
    fd.append('description',event.description);
    fd.append('idSecond',event.idSecond);
    fd.append('_id',event._id);

    if(this.isDev) {
      return this.httpClient.post<any>('http://localhost:8080/pet/register/newPetEvent', fd);
    }else{
      return this.httpClient.post<any>('pet/register/newPetEvent', fd);
    }
  }

  updateNewPetEvent(event):Observable<any> {
    const fd = new FormData();
    fd.append('title',event.title);
    fd.append('date',event.date);
    fd.append('enddate',event.enddate);
    fd.append('description',event.description);
    fd.append('idSecond',event.idSecond);
    fd.append('idEventUpdate',event.idEventUpdate);
    fd.append('_id',event._id);

    if(this.isDev) {
      return this.httpClient.put<any>('http://localhost:8080/pet/update/updatePetEvent', fd);
    }else{
      return this.httpClient.put<any>('pet/update/updatePetEvent', fd);
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
    fd.append('comment', obj.comment);
    fd.append('petName', obj.petName);
    fd.append('email', obj.email);
    fd.append('photo', obj.photo);
    fd.append('products', JSON.stringify(obj.products));
    fd.append('total', obj.total);

    if(this.isDev) {
      return this.httpClient.post<any>('http://localhost:8080/pet/register/generateQrCodePet', fd);
    }else{
      return this.httpClient.post<any>('pet/register/generateQrCodePet', fd);
    }
  }
  
  updateStatusCodePet(obj: any):Observable<any> {
    const fd = new FormData();
    fd.append('_id', obj.idPetPrincipal);
    fd.append('idObject', obj.idObject);
    fd.append('idItemSelected', obj.idItemSelected);
    fd.append('status', obj.status);
    fd.append('photo', obj.photo);
    if(this.isDev) {
      return this.httpClient.put<any>('http://localhost:8080/pet/update/updateStatusQrCodePet', fd);
    }else{
      return this.httpClient.put<any>('pet/update/updateStatusQrCodePet', fd);
    }
  }

  getPetDataList(id, idSecondary: any):Observable<any> {    
    if (this.isDev) {
      return this.httpClient.get<any>('http://localhost:8080/pet/getPetDataList?id=' + id+'&idSecond='+ idSecondary);
    } else {
      return this.httpClient.get<any>('pet/getPetDataList?id=' + id+'&idSecond='+ idSecondary );
    }
  }

  getAllProfileList(id):Observable<any> {
    if (this.isDev) {
      return this.httpClient.get<any>('http://localhost:8080/pet/getAllProfileList/' + id);
    } else {
      return this.httpClient.get<any>('pet/getAllProfileList/' + id);
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
  
  getPetPermissionsDataList(id: any, idSecondary: any):Observable<any> {
    if (this.isDev) {
      return this.httpClient.get<any>('http://localhost:8080/pet/getPermissionsData/' + id +'/'+ idSecondary);
    } else {
      return this.httpClient.get<any>('pet/getPermissionsData/' + id +'/'+ idSecondary);
    }
  }


  updatePetPermissionInfo(obj: any):Observable<any> {
    const fd = new FormData();
    fd.append('_id', obj.id);
    fd.append('idSecondary', obj.idSecondary);
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
    return this.httpClient.get<any>('http://localhost:8080/pet/getAllPets/');
  } else {
    return this.httpClient.get<any>('pet/getAllPets/');
  }
}

getAllCodeList():Observable<any> {
  this.loadToken();
  if (this.isDev) {
    return this.httpClient.get<any>('http://localhost:8080/pet/getAllCodePetsList/');
  } else {
    return this.httpClient.get<any>('pet/getAllCodePetsList/');
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


geDataList():Observable<any> {
  if (this.isDev) {
    return this.httpClient.get<any>('http://localhost:8080/pet/getAdminDataList/');
  } else {
    return this.httpClient.get<any>('pet/getAdminDataList/');
  }
}

getAllShopProductList():Observable<any> {
  if (this.isDev) {
    return this.httpClient.get<any>('http://localhost:8080/pet/getAllProductShopList/');
  } else {
    return this.httpClient.get<any>('pet/getAllProductShopList/');
  }
}

getHistoryList(id:any):Observable<any> {
  if (this.isDev) {
    return this.httpClient.get<any>('http://localhost:8080/pet/getHistoryShopList/'+ id);
  } else {
    return this.httpClient.get<any>('pet/getHistoryShopList/'+ id);
  }
}

  
sendNewProduct(obj):Observable<any> {
  const fd = new FormData();
  fd.append('productName',obj.productName);
  fd.append('size',obj.size);
  fd.append('color',obj.color);
  fd.append('cost',obj.cost);
  fd.append('quantity',obj.quantity);
  fd.append('description',obj.description);
  fd.append('_id',obj.id);
  
  
  if(this.isDev) {
    return this.httpClient.post<any>('http://localhost:8080/pet/register/new-product/', fd);
  }else{
    return this.httpClient.post<any>('pet/register/new-product/', fd);
  }
}

updateNewProduct(obj):Observable<any> {
  const fd = new FormData();
  fd.append('productName',obj.productName);
  fd.append('size',obj.size);
  fd.append('color',obj.color);
  fd.append('cost',obj.cost);
  fd.append('quantity',obj.quantity);
  fd.append('description',obj.description);
  fd.append('_id',obj.id);
  fd.append('idProduct',obj.idProduct);
  
  
  if(this.isDev) {
    return this.httpClient.put<any>('http://localhost:8080/pet/update/new-product/', fd);
  }else{
    return this.httpClient.put<any>('pet/update/new-product/', fd);
  }
}

addPhotoFirstORSecond(obj:any):Observable<any> { 
  const fd = new FormData();
  fd.append('image', obj.image);
  fd.append('idProduct', obj.idProduct);
  fd.append('isFistPhoto', obj.isFistPhoto);
  fd.append('_id',obj.id);

  if(this.isDev) {
    return this.httpClient.put<any>('http://localhost:8080/pet/register/registerPhotoPetProduct', fd);
  }else{
    return this.httpClient.put<any>('pet/register/registerPhotoPetProduct', fd);
  }
}


// admin


// Notifications

getNotificationsService(id):Observable<any> {
 // let headers = new Headers();
  // this.loadToken();
  // headers.append('Authorization', this.authToken);
  // headers.append('Content-Type', 'application/json');
  if (this.isDev) {
    return this.httpClient.get<any>('http://localhost:8080/pet/notifications/getNotificationsList/'+ id);
  } else {
    return this.httpClient.get<any>('pet/notifications/getNotificationsList/'+ id);
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

  storePrincipalUserData(pet) {
    localStorage.setItem('petPrincipal', JSON.stringify(pet));
    this.petPrincipal = pet;
  }

  setidTrack(id){
    localStorage.setItem('idSelected', id);
  }

  getidTrack(){
    return localStorage.getItem('idSelected');
  }
  
  getPrincipalUserData() {
    return localStorage.getItem("petPrincipal");
  }

  getLocalPet(){
    return localStorage.getItem("pet");
  }

  setstoreUserData(pet){
    localStorage.setItem('pet', JSON.stringify(pet));
    this.pet = pet;
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