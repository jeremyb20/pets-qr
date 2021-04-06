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
    
    
    }    

    get f() { return this.newProductPetForm.controls; }

    collapsed = false;

    ngOnInit() {
    }
}
