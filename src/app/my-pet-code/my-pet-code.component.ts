import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';

import { PetService } from 'src/app/common/services/pet.service';
import { NotificationService } from 'src/app/common/services/notification.service';
import { Router,ActivatedRoute } from '@angular/router';
import { MediaResponse, MediaService } from '../common/services/media.service';
import { darkStyle, lightStyle } from '../common/constants/map-theme';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { MapsAPILoader } from '@agm/core';
import {Location} from '@angular/common';
import { Subscription } from 'rxjs';

declare var $ :any

@Component({
  selector: 'app-my-pet-code',
  templateUrl: './my-pet-code.component.html',
  styleUrls: ['./my-pet-code.component.scss']
})
export class MyPetCodeComponent implements OnInit {
  private mediaSubscription: Subscription;
  public searchControl: FormControl;
  getLinkIdParam: null;
  zoom: number = 12;
  lat: number = 9.93040049002793;
  lng: number = -84.09062837772197;
  markers: marker[] = [];
  gomarkers: gomarker[] = []
  profile: any;
  showInfo: boolean = false;
  loading: boolean = false;
  imageUrl: any;
  Media: MediaResponse;
  hideMenu: boolean = false;
  currentTimer: any;
  permissionData: any;

  // map 
  showInfoFinal: boolean = false;
  addDestiny: boolean = false;
  generate: boolean = false;
  origin : any;
  destination : any;
  getTrack: boolean = false;

  @ViewChild("search")
  public searchElementRef: ElementRef;

  public renderOptions = {
    suppressMarkers: true,
  }
  public markerOptions = {
    origin: {
        icon: 'https://i.imgur.com/iYIaFyb.png',
        draggable: false,
    },
    destination: {
        icon: 'https://i.imgur.com/iYIaFyb.png',
        opacity: 0.8,
    },
  }

  constructor(private formBuilder: FormBuilder, private media: MediaService, private mapsAPILoader: MapsAPILoader, private ngZone: NgZone,  private petService: PetService,private _notificationSvc: NotificationService, private route: ActivatedRoute , private router: Router) {
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

  ngOnInit() {}

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
        isDestination: true,
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
  
  showPopupMapPetHome() {
    $('#showPopupMapPetHome').modal('show');
    this. setCurrentPosition();
  }

  setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.zoom = 17;

        this.gomarkers.push({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          draggable: false,
          isDestination: false,
          photo: 'https://cdn.worldvectorlogo.com/logos/google-maps-2020-icon.svg'
        });
        this.showInfo = true;
        this.addDestiny = false;
        this.generate = false;
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  changePosition(mPosition: any){
    this.gomarkers.shift();
    this.showInfo = false;
   
  }

  mapClicked($event: MouseEvent) {
    var event: any;
      event = $event
    this.showInfo = true;
    if(this.gomarkers.length <= 0){
      this.gomarkers.push({
        lat: event.coords.lat,
        lng: event.coords.lng,
        draggable: false,
        isDestination: false,
        photo: 'https://cdn.worldvectorlogo.com/logos/google-maps-2020-icon.svg'
      });
      this.generate = true;
    }
  }

  createRoute(){
    this.generate = true;
    this.origin = { lat: parseFloat(String(this.gomarkers[0].lat)), lng: parseFloat(String(this.gomarkers[0].lng)) }
    this.destination = { lat: parseFloat(String(this.markers[0].lat)), lng: parseFloat(String(this.markers[0].lng)) }

    var directionsService = new google.maps.DirectionsService();
    var haight = new google.maps.LatLng(this.gomarkers[0].lat, this.gomarkers[0].lng);
    var oceanBeach = new google.maps.LatLng(this.markers[0].lat, this.markers[0].lng);
    var request = {
        origin: haight,
        destination: oceanBeach,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, (response, status) => {
      if (status == 'OK') {
        this.showInfo = false;
        // this.confirmData = response.routes[0].legs[0]; 
        // this.distance = this.confirmData.distance.text;
        // this.duration = this.confirmData.duration.text;
        // this.end_address = this.confirmData.end_address;
        // this.start_address = this.confirmData.start_address;
        
        // let costFinal = 1600;
        // let endDirection = '<p><b>Dirrecion final:</b>' + this.end_address; + '<br></p>';
        // let startDirection = '<p><b>Dirrecion inicial:</b>' + this.start_address; + '<br></p>';
        // let distance = '<p><b>Distancia:</b>' + this.distance; + '<br></p>';
        // let timeArrival = '<p><b>Tiempo de llegada:</b>' + this.duration + '<br></p>';
        // let cost = '<p><b>Costo:</b> ₡' + costFinal + '<br></p>';
        // let msg = distance + cost + timeArrival + startDirection + endDirection; 
        
        Swal.fire({
          title: "Confirmación de ida",
          html: 'Ir a la direccion?',
          showCancelButton: true,
          allowEscapeKey: false,
          confirmButtonText: 'OK',
          cancelButtonText: 'No',
          allowOutsideClick: false,
          buttonsStyling: false,
          reverseButtons: true,
          position: 'top',
          padding: 0,
          customClass: { container: 'sw-leave-container', cancelButton: 'btn btn-warning border col-auto mr-auto p-2', confirmButton: 'col-auto btn btn-info p-2' }
        })
        .then((result) => {
            if (result.value){
              $('#showPopupMapPetHome').modal('hide');
              window.open('https://www.google.com/maps/dir/?api=1&origin='+this.gomarkers[0].lat+','+this.gomarkers[0].lng+'&destination='+this.markers[0].lat+','+this.markers[0].lng+'&travelmode=driving','_blank');
            } 
        });
      }else {
        this.showInfo = true;
        $('#showPopupMapPetHome').modal('hide');
      }
    });
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

interface gomarker {
	lat: number;
	lng: number;
	label?: string;
  draggable: boolean;
  isDestination?: boolean;
  photo?: any;
}
