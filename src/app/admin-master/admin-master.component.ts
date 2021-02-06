import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/common/services/notification.service';
import { MediaResponse, MediaService } from '../common/services/media.service';
import { PetService } from 'src/app/common/services/pet.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';


declare var $: any;

interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}


@Component({
  selector: 'app-admin-master',
  templateUrl: './admin-master.component.html',
  styleUrls: ['./admin-master.component.scss']
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

  order: any;
  orderHistory: any;

    constructor(private petService: PetService, private media: MediaService,private _notificationSvc: NotificationService, private router: Router, private formBuilder: FormBuilder) {
        this.petLogged = this.petService.getLocalPet()
        this.pet = JSON.parse(this.petLogged);
        if(this.pet != null){
          switch (this.pet.userState) {
            case 0:
              this.router.navigate(['/admin']);
              break;
            case 3:
              this.router.navigate(['/dashboard-pet']);
              break;
    
            default:
              break;
          }
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
        this.getAllProductList();
    }    

    get f() { return this.newProductPetForm.controls; }



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
          this.order = [];
          this.orderHistory = [];
          this.allUsersData.forEach(element => {
              if(element.code.length == 1){
                  element.code.forEach(item => {
                      if(item.status == 'Recibido'){
                          this.orderHistory.push(element);
                      }else{
                          this.order.push(element);
                      }
                  });
              }
          });
          this.showCardMsgOrderList = (this.order.length > 0)? false: true;
          this.showCardMsgOrderHistoryList = (this.orderHistory.length > 0)? false: true;
      },
      error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor DE REVISAR', 6000);
      });
    }

    getAllProductList() {
      this.petService.getAllProductList().subscribe(data => {
          this.allProductsData = data.productsList;
          this.filteredProductData = this.allProductsData;
      },
      error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor DE REVISAR', 6000);
      });
    }

    addNewProduct() {
      $('#addNewProductModal').modal('show');
    }

    checkFoto(item:any, value:number){
      console.log(item);
      console.log(value);
      this.itemProductSelected = item;
      this.isfirstPhoto = (value == 1)? true: false;
      console.log(this.isfirstPhoto)
      $('#addNewFistorSecondPhotoModal').modal('show');
    }

    sendNewProduct() {
      this.submitted = true;
      // stop here if form is invalid
      if (this.newProductPetForm.invalid) {
          return;
      }
      

      var title = 'Agregar Nuevo Producto?'
      Swal.fire({
          title: title,
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: `Ok`,
          denyButtonText: `No cambiar`,
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
            }
            
            this.petService.sendNewProduct(newProduct, this.file, this.fileSecond).subscribe(data => {
              if(data.success) {
                  Swal.fire('Saved!', '', 'success');
                  this.getAllProductList();
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

    sendPhotoSubmit(){
      this.loading = true;
      var object = {
        idProduct:this.itemProductSelected._id,
        isFistPhoto: this.isfirstPhoto,
        image: (this.isfirstPhoto)?this.file:this.fileSecond
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

    dropdowSelect(state: any, item: any){
        var title = 'Cambiar Status?'
        Swal.fire({
            title: title,
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: `Ok`,
            denyButtonText: `No cambiar`,
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                var object = {
                    id: item._id,
                    status: state,
                    photo: this.pet.photo
                  }
              
                  this.petService.updateStatusCodePet(object).subscribe(data => {
                    if(data.success) {
                        location.reload();
                        Swal.fire('Saved!', '', 'success');
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
                return obj.petName.toLowerCase().indexOf(query.toLowerCase()) !== -1;
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
