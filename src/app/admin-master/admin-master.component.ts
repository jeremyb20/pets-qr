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



@Component({
  selector: 'app-admin-master',
  templateUrl: './admin-master.component.html',
  styleUrls: ['./admin-master.component.scss']
})
export class AdminMasterComponent implements OnInit {
  private mediaSubscription: Subscription;
  public AngularxQrCode: string = null;
  id: number = 1;
  idTab: number = 1;
  query: string;

  petLogged: any;
  pet : any;
  allUsersData: any;
  adminProfileData: any;
  Media: MediaResponse;
  loading: boolean = false;
  showCardMsgOrderList: boolean = false;
  showCardMsgOrderHistoryList: boolean = false;
  filteredData: any;
  // order

  order: any;
  orderHistory: any;

    constructor(private petService: PetService, private media: MediaService,private _notificationSvc: NotificationService, private router: Router) {
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
    }    


    ngOnInit() {
      //this.getDataAdminList();
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

    checkQrCode(link:any){
        $('#qrCodeInfoDialog').modal('show');
        this.AngularxQrCode = link;
    }

}
