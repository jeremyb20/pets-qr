import { Component, OnInit } from '@angular/core';
import { AuthServices } from '../common/services/auth.service';
import { PetService } from '../common/services/pet.service';
import { NotificationService } from '../common/services/notification.service';
import { MediaService, MediaResponse } from '../common/services/media.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
declare var $ :any;

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {
  private mediaSubscription: Subscription;
  Media: MediaResponse;
  userLogged: any;
  user:any;
  loading: boolean = false;
  profile: any;
  shoppingCartList: any;

  constructor(public authService: AuthServices, public petService: PetService, private _notificationSvc: NotificationService, private media: MediaService,private route: Router) {
    this.mediaSubscription = this.media.subscribeMedia().subscribe(result => {
      this.Media = result;
    });
    this.userLogged = this.authService.getLocalUser();
    if(this.userLogged == null ){
        this.userLogged = this.petService.getLocalPet();
    }
    this.user = JSON.parse(this.userLogged);
  }

  ngOnInit() {
  }

  getPetDataList() {
    this.petService.getPetDaList(this.user.id).subscribe(data => {
      this.profile = data;
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.user.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }

  checkMyShoppingCart(){
    $('#checkMyShoppingCartModal').modal('show');
  }


}
