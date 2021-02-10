import { Component, OnInit ,Input} from '@angular/core';
import { AuthServices } from '../common/services/auth.service';
import { PetService } from '../common/services/pet.service';
import { NotificationService } from '../common/services/notification.service';
import { MediaService, MediaResponse } from '../common/services/media.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2/dist/sweetalert2.js';
declare var $ :any;
declare var window: any;

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
  allProductsData: any;
  filteredProductData: any;
  query2: string;
  showNoProductFound: boolean = false;
  counter: number = 0;
  allListShoppingCartItem = [];
  finalCard: any;
  test: any;
  loadingQr: boolean = false;
  total: number;
  phoneSinpe: string = '70160434';
  @Input() products: any = [];
  private singleProduct;
  public isAdded;

  constructor(public authService: AuthServices, public petService: PetService, private _notificationSvc: NotificationService, private media: MediaService,private route: Router) {
    this.mediaSubscription = this.media.subscribeMedia().subscribe(result => {
      this.Media = result;
    });
    this.userLogged = this.authService.getLocalUser();
    if(this.userLogged == null ){
        this.userLogged = this.petService.getLocalPet();
    }
    this.user = JSON.parse(this.userLogged);
    this.getAllMyProduct();
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

  getAllMyProduct(){
    this.petService.getAllShopProductList().subscribe(data => {
      this.allProductsData = data.productsList;
      this.filteredProductData = this.allProductsData;
    },
    error => {
    this.loading = false;
    this._notificationSvc.warning('Hola '+this.user.petName+'', 'Ocurrio un error favor Contactar al administrador', 6000);
    });
  }

  addToShoppingCart(event, item:any){

    // If Item is already added then display alert message
    if (event.target.classList.contains('btn-success')) { 
      Swal.fire({
        position: 'top',
        icon: 'error',
        title: 'Oops...',
        text: 'Este producto ya esta dentro del carrito!'
      })
      return false;
    }

    // Change button color to green
    this.allProductsData.map((val, index) => {
      if (val._id === item._id) {
        item.class = 'btn-success';
      }
    })
  
    this.allListShoppingCartItem.push(item);
    this.finalCard = this.allListShoppingCartItem.filter((item, i, ar) => ar.indexOf(item) === i);
    this.counter = this.finalCard.length;
  }

  removeItem(item){
    this.test = [];
    var index = this.finalCard.indexOf(item);
    if (index !== -1) {
      this.finalCard.splice(index, 1);
    }

    this.allListShoppingCartItem = this.finalCard;

    this.allProductsData.map((val, index) => {
      if (val._id === item._id) {
        item.class = '';
      }
    })
    
    this.finalCard.forEach(element => {
      this.test.push(parseInt(element.cost));
    });
    this.total = this.test.reduce((sum, p) => sum + p, 0)

    this.counter = this.finalCard.length;
  }

  filterProductData(query2): any[] {
    if (!query2) {
      this.filteredProductData = this.allProductsData;
    }
    
    if(this.filteredProductData != undefined){
        this.filteredProductData = this.filteredProductData.filter(obj => {
          if (!query2) {
              return obj;
          }
          return obj.productName.toLowerCase().indexOf(query2.toLowerCase()) !== -1;
      });
    }
    if(this.filteredProductData != undefined)
      this.showNoProductFound = (this.filteredProductData.length == 0)? true: false
    return this.filteredProductData;
}

  checkMyShoppingCart(){
    $('#checkMyShoppingCartModal').modal('show');
    this.test = []
    this.finalCard.forEach(element => {
      this.test.push(parseInt(element.cost));
    });
    this.total = this.test.reduce((sum, p) => sum + p, 0)
  }

  goToPay() {
    $('#goToPayModal').modal('show');
  }

  copyInputMessage(inputElement:any){
    Swal.fire({
      position: 'top-end',
      width: 300,
      icon: 'success',
      title: 'Copiado al portapapeles',
      showConfirmButton: false,
      timer: 1500
    })
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (this.phoneSinpe));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
  }


  generateQrCode() {
    this.loadingQr = true;
    var object = {
      id: this.user.id,
      status: "Ordenando",
      petName: this.user.petName,
      photo: this.user.photo
    }
    this.petService.generateQrCodePet(object).subscribe(data => {
      if(data.success) {
        Swal.fire({
          title: 'Compra de producto exitoso' ,
          html: data.msg,
          icon: "success",
          allowEscapeKey: false,
          allowOutsideClick: false,
          position: 'top',
          customClass: { confirmButton: 'col-auto btn btn-info' }
        })
        .then((result) => {
          if (result.value){
            this.loadingQr = true;
            $('#goToPayModal').modal('hide');
            setTimeout(() => { this.route.navigate(['/dashboard-pet']); }, 3000);
            location.reload();
          }   
        });
      } else {
        $('#goToPayModal').modal('hide');
        this.loadingQr = false;
        this._notificationSvc.warning('Hola '+this.user.petName+'', data.msg, 6000);
      }
    },
    error => {
      this.loadingQr = false;
      this._notificationSvc.warning('Hola '+this.user.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }


}
