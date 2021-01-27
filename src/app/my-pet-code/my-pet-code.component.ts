import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PetService } from 'src/app/common/services/pet.service';
import { NotificationService } from 'src/app/common/services/notification.service';
import { Router,ActivatedRoute } from '@angular/router';
import { MediaResponse, MediaService } from '../common/services/media.service';
import { darkStyle, lightStyle } from '../common/constants/map-theme';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { MapsAPILoader } from '@agm/core';
import {Location} from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-pet-code',
  templateUrl: './my-pet-code.component.html',
  styleUrls: ['./my-pet-code.component.scss']
})
export class MyPetCodeComponent implements OnInit {
  private mediaSubscription: Subscription;
  getLinkIdParam: null;
  zoom: number = 12;
  lat: number = 9.93040049002793;
  lng: number = -84.09062837772197;
  markers: marker[] = [];
  profile: any;
  showInfo: boolean = false;
  loading: boolean = false;
  imageUrl: any;
  Media: MediaResponse;
  hideMenu: boolean = false;
  currentTimer: any;
  permissionData: any;


  constructor(private formBuilder: FormBuilder, private media: MediaService,  private petService: PetService,private _notificationSvc: NotificationService, private route: ActivatedRoute , private router: Router) {
    this.route.params.subscribe(params => {
      this.getLinkIdParam = params.id; 
    });

    if(this.getLinkIdParam == undefined) {
      this.route.queryParams.subscribe(params => {
        this.getLinkIdParam = params.id;
        this.hideMenu = true;
      });
    }
    
    this.mediaSubscription = this.media.subscribeMedia().subscribe(media => {
      this.Media = media;
    });

    var today = new Date()
    var curHr = today.getHours()
    
    if (curHr < 12) {
      this.currentTimer = lightStyle;
    } else if (curHr < 18) {
      this.currentTimer = darkStyle;
    } else {
      this.currentTimer = darkStyle;
    }
    this.getPermissionInfo();
    this.getPetDataList();
   
   }

  ngOnInit() {
  }

  getPermissionInfo() {
    this.petService.getPetPermissionsDataList(this.getLinkIdParam).subscribe(data => {
      this.permissionData = data.permissions[0];
      if(this.permissionData.length<=0){
        this.permissionData = {
          showPhoneInfo: true,
          showEmailInfo: true,
          showLinkTwitter: true,
          showLinkFacebook: true,
          showLinkInstagram: true,
          showOwnerPetName: true,
          showBirthDate: true,
          showAddressInfo: true,
          showAgeInfo: true,
          showVeterinarianContact: true,
          showPhoneVeterinarian: true,
          showHealthAndRequirements: true,
          showFavoriteActivities: true,
          showLocationInfo: true
        }
      }else{
        this.permissionData = data.permissions[0];
      }
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.profile.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }

  getPetDataList() {
    this.petService.getPetDaList(this.getLinkIdParam).subscribe(data => {
      this.profile = data;
      this.imageUrl = this.profile.photo;
      this.markers.push({
        lat: this.profile.lat,
        lng: this.profile.lng,
        draggable: false,
        isDestination: false,
        photo: 'https://cdn.worldvectorlogo.com/logos/google-maps-2020-icon.svg'
      });
      this.showInfo = true;
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.profile.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
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

	  let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = inputElement;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    
	}

}
interface marker {
	lat: number;
	lng: number;
	label?: string;
  draggable: boolean;
  isDestination?: boolean;
  photo?: any;
}
