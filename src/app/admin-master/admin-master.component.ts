import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/common/services/notification.service';
import { MediaResponse, MediaService } from '../common/services/media.service';
import { PetService } from 'src/app/common/services/pet.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  AUTO_STYLE,
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import _ from "lodash";

declare var $: any;

interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

const DEFAULT_DURATION = 300;


@Component({
  selector: 'app-admin-master',
  templateUrl: './admin-master.component.html',
  styleUrls: ['./admin-master.component.scss'],
  animations: [
    trigger('collapse', [
      state('false', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
      state('true', style({ height: '0', visibility: 'hidden' })),
      transition('false => true', animate(DEFAULT_DURATION + 'ms ease-in')),
      transition('true => false', animate(DEFAULT_DURATION + 'ms ease-out'))
    ])
  ]
})
export class AdminMasterComponent implements OnInit {
  private mediaSubscription: Subscription;
  public AngularxQrCode: string = null;
  newProductPetForm: FormGroup;
  id: number = 1;
  idTab: number = 1;
  query: string;
  query2: string;

  petLogged: any;
  pet : any;
  adminProfileData: any;
  Media: MediaResponse;
  loading: boolean = false;
  showCardMsgOrderList: boolean = false;
  showCardMsgOrderHistoryList: boolean = false;
  allUsersData: any;
  filteredData: any;
  allProductsData: any;
  filteredProductData: any;
  submitted = false;
  // order
  file : File;
  fileSecond : File;

  photoSelectedSecond: String | ArrayBuffer;
  photoSelected: String | ArrayBuffer;
  isfirstPhoto: boolean = false;
  itemProductSelected: any;
  linkPhoto: String;
  linkFirst: String;
  linkSecond: String;
  isNewProduct: boolean = false;
  idItemProduct: number;
  order: any;
  orderHistory: any;
  showPetSecondArray: any;

    constructor(private petService: PetService, private media: MediaService,private _notificationSvc: NotificationService, private router: Router, private formBuilder: FormBuilder) {
        this.petLogged = this.petService.getLocalPet()
        this.pet = JSON.parse(this.petLogged);
        if(this.pet != null){
          // switch (this.pet.userState) {
          //   case 0:
          //     this.router.navigate(['/admin']);
          //     break;
          //   case 3:
          //     this.router.navigate(['/dashboard-pet']);
          //     break;
    
          //   default:
          //     break;
          // }
        }else{
          this.router.navigate(['/home']);
          localStorage.clear();
          return;
        }

        this.AngularxQrCode = 'Initial QR code data string';

        this.mediaSubscription = this.media.subscribeMedia().subscribe(media => {
          this.Media = media;
        });
    
        this.getAllUsers();
    }    

    get f() { return this.newProductPetForm.controls; }

    collapsed = false;

    ngOnInit() {
      //this.getDataAdminList();
      this.newProductPetForm = this.formBuilder.group({
        productName: ['', Validators.required],
        size: ['', [Validators.required]],
        color: ['', Validators.required],
        cost: ['', Validators.required],
        quantity:['', Validators.required],
        description: ['', Validators.required],
      });
    }

    // getDataAdminList() {
    //   this.petService.getAdminDataList().subscribe(data => {
    //     this.adminProfileData = data;
    //   },
    //   error => {
    //     this.loading = false;
    //     this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor DE REVISAR', 6000);
    //   });
    // }

    stepTrackOrder(step: number){
        this.id = step;
    }

    stepButtonOrder(number: any){
        this.idTab = number;
    }

    getAllUsers() {
      this.petService.getPetsList().subscribe(data => {
          this.allUsersData = data;
          this.filteredData = this.allUsersData;
      
          this.getAllCode();
      },
      error => {
        this.loading = false;
        this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor de revisar get all users', 6000);
      });
    }

    showPanel(item: any) {
      item.showPanel = !item.showPanel;
      this.order.map((val, index) => {
        if (val._id != item._id) {
            val.showPanel = true;
        }
      });
      this.orderHistory.map((val, index) => {
        if (val._id != item._id) {
            val.showPanel = true;
        }
      });
    }

    getAllCode(){
      this.petService.getAllCodeList().subscribe(data => {
        this.order = [];
        this.orderHistory = [];
        
        data.forEach(element => {
          if(element.status != 'Recibido'){
            this.order.push(element);
          }else{
            this.orderHistory.push(element);
          }
          // if(element.code.length >= 1){
          //   element.code.forEach(item => {
          //     item.showPanel = true;
          //     item.products.forEach(element => {
          //       var object = {
          //         comment: item.comment,
          //         idPrincipal: item.idPrincipal,
          //         petName: item.petName,
          //         email: item.email,
          //         products: [{
          //           cost: element.cost,
          //           description: element.description,
          //           idCan: element.idCan,
          //           link: element.link,
          //           petName: element.petName,
          //           petPhoto: element.petPhoto,
          //           productName: element.productName,
          //           status: element.status,
          //           _id: element._id
          //         }],
          //         showPanel: item.showPanel,
          //         total: item.total,
          //         _id: item._id
          //       }
          //       if(element.status != 'Recibido'){
          //         this.order.push(object);
          //       }else{
          //         this.orderHistory.push(object);
          //       }
          //     });
          //   });
          // }
        });

        this.orderHistory = _.uniqWith(this.orderHistory, (f1,f2) => {
          return f1._id === f2._id;
        });
        this.getAllProductList();
        this.showCardMsgOrderList = (this.order.length > 0)? false: true;
        this.showCardMsgOrderHistoryList = (this.orderHistory.length > 0)? false: true;
      },
      error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor de revisar get all users', 6000);
      });
    }

    getAllProductList() {
      this.petService.getAllShopProductList().subscribe(data => {
          this.allProductsData = data.productsList;
          this.filteredProductData = this.allProductsData;
      },
      error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor de revisar All products list', 6000);
      });
    }

    addNewProduct(isNew: boolean,item: any) {
      if(isNew){
        this.newProductPetForm = this.formBuilder.group({
          productName: ['', Validators.required],
          size: ['', [Validators.required]],
          color: ['', Validators.required],
          cost: ['', Validators.required],
          quantity:['', Validators.required],
          description: ['', Validators.required],
        });
         $('#addNewProductModal').modal('show');
         this.isNewProduct = true;
      }else {
        $('#addNewProductModal').modal('show');
        this.isNewProduct = false;
        this.idItemProduct = item._id
        this.newProductPetForm = this.formBuilder.group({
          productName: [item.productName, Validators.required],
          size: [item.size, [Validators.required]],
          color: [item.color, Validators.required],
          cost: [item.cost, Validators.required],
          quantity:[item.quantity, Validators.required],
          description: [item.description, Validators.required],
        });
      }
     
    }

    showSecondPet(item){
      this.showPetSecondArray = item.newPetProfile;
      $('#showPetModal').modal('show');
    }

    checkFoto(item:any, value:number){
      this.itemProductSelected = item;
      this.isfirstPhoto = (value == 1)? true: false;
      this.linkPhoto = (value == 1)?item.firstPhoto:item.secondPhoto
      $('#addNewFistorSecondPhotoModal').modal('show');
    }

    seeFoto(item:any){
      this.linkFirst = item.firstPhoto;
      this.linkSecond = item.secondPhoto;
      $('#visualization').modal('show');
    }

    sendNewProduct(isNewProduct: boolean) {
      this.submitted = true;
      // stop here if form is invalid
      if (this.newProductPetForm.invalid) {
          return;
      }
      
      if(isNewProduct){
        var title = 'Agregar Nuevo Producto?'
        Swal.fire({
            title: title,
            showCancelButton: true,
            confirmButtonText: `Ok`,
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
              this.loading = true;
              var newProduct = {
                productName: this.f.productName.value,
                size: this.f.size.value,
                color: this.f.color.value,
                cost: this.f.cost.value,
                description: this.f.description.value,
                quantity: this.f.quantity.value,
                id: this.pet.id
              }
              
              this.petService.sendNewProduct(newProduct).subscribe(data => {
                if(data.success) {
                    Swal.fire('Saved!', '', 'success');
                    this.loading = false;
                    $('#addNewProductModal').modal('hide');
                    this.getAllProductList();
                } else {
                  $('#addNewProductModal').modal('hide');
                  this._notificationSvc.warning('Hola '+this.pet.petName+'', data.msg, 6000);
                }
              },
              error => {
                this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
              });
  
              Swal.fire('Saved!', '', 'success')
            } else if (result.isDenied) {
              Swal.fire('Cambios no ha sido guardados', '', 'info')
            }
          })
      }else{
        var title = 'Editar Producto?'
        Swal.fire({
            title: title,
            showCancelButton: true,
            confirmButtonText: `Ok`,
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
              this.loading = true;
              var updateProduct = {
                productName: this.f.productName.value,
                size: this.f.size.value,
                color: this.f.color.value,
                cost: this.f.cost.value,
                description: this.f.description.value,
                quantity: this.f.quantity.value,
                id: this.pet.id,
                idProduct: this.idItemProduct
              }
              this.petService.updateNewProduct(updateProduct).subscribe(data => {
                if(data.success) {
                    Swal.fire('Saved!', '', 'success');
                    this.loading = false;
                    $('#addNewProductModal').modal('hide');
                    this.getAllProductList();
                } else {
                  $('#addNewProductModal').modal('hide');
                  this._notificationSvc.warning('Hola '+this.pet.petName+'', data.msg, 6000);
                }
              },
              error => {
                this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
              });
  
              Swal.fire('Saved!', '', 'success')
            } else if (result.isDenied) {
              Swal.fire('Cambios no ha sido guardados', '', 'info')
            }
          })
      }
    }

    sendPhotoSubmit(){
      this.loading = true;
      var object = {
        idProduct:this.itemProductSelected._id,
        isFistPhoto: this.isfirstPhoto,
        image: (this.isfirstPhoto)?this.file:this.fileSecond,
        id: this.pet.id
      }

      this.petService.addPhotoFirstORSecond(object).subscribe(data => {
        if(data.success) {
          $('#addNewFistorSecondPhotoModal').modal('hide');
          this._notificationSvc.success('Hola '+this.pet.petName+'', data.msg, 6000);
          this.getAllProductList();
          this.loading = false;
        } else {
          $('#addNewFistorSecondPhotoModal').modal('hide');
          this.loading = false;
          this._notificationSvc.warning('Hola '+this.pet.petName+'', data.msg, 6000);
        }
      },
      error => {
        this.loading = false;
        this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
      });
    }

    dropdowSelect(state: any, itemPrincipal:any, item: any){
        var title = 'Cambiar Status?'
        Swal.fire({
            title: title,
            showDenyButton: false,
            showCancelButton: true,
            confirmButtonText: `Ok`,
            denyButtonText: `No cambiar`,
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                var object = {
                    idPetPrincipal: itemPrincipal.idPrincipal,
                    idObject: itemPrincipal._id,
                    idItemSelected: item._id,
                    status: state,
                    photo: this.pet.photo
                  }
              
                  this.petService.updateStatusCodePet(object).subscribe(data => {
                    if(data.success) {
                        Swal.fire('Saved!', '', 'success');
                        setTimeout(() => { location.reload(); }, 3000);
                    } else {
                      $('#qrCodeInfoDialog').modal('hide');
                      this._notificationSvc.warning('Hola '+this.pet.petName+'', data.msg, 6000);
                    }
                  },
                  error => {
                    this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
                  });

              Swal.fire('Saved!', '', 'success')
            } else if (result.isDenied) {
              Swal.fire('Cambios no ha sido guardados', '', 'info')
            }
          })
    }

    filterData(query): any[] {
        if (!query) {
          this.filteredData = this.allUsersData;
        }
        
        if(this.filteredData != undefined){
            this.filteredData = this.filteredData.filter(obj => {
                if (!query) {
                    return obj;
                }
                return obj.email.toLowerCase().indexOf(query.toLowerCase()) !== -1;
            });
        }
        return this.filteredData;
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
      return this.filteredProductData;
  }

    checkQrCode(link:any){
      $('#qrCodeInfoDialog').modal('show');
      this.AngularxQrCode = link;
    }
  

    processFile(event: HtmlInputEvent): void {

      if(event.target.files && event.target.files[0]){
        this.file = <File>event.target.files[0];
  
        const reader = new FileReader();
  
        reader.onload = e => this.photoSelected = reader.result;
        reader.readAsDataURL(this.file);
      }
    }

    processFileSecond(event: HtmlInputEvent): void {

      if(event.target.files && event.target.files[0]){
        this.fileSecond = <File>event.target.files[0];
  
        const reader = new FileReader();
  
        reader.onload = e => this.photoSelectedSecond = reader.result;
        reader.readAsDataURL(this.fileSecond);
      }
    }
}
