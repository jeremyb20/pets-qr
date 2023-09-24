import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NotificationService } from 'src/app/common/services/notification.service';
import { MediaResponse, MediaService } from '../common/services/media.service';
import { PetService } from 'src/app/common/services/pet.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';

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
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';

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
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;
  @ViewChildren(MapMarker) markers: QueryList<MapMarker>;

  points: PointMap[] = [];
  infoContent: any;
  dataContent: any;
  options = {
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 15,
    minZoom: 6,
  };
  id: number = 1;

  petLogged: any;
  pet : any;
  users: any;
  Media: MediaResponse;
  loading: boolean = false;
  zoom: number = 12;
  display: any;
  center: google.maps.LatLngLiteral = {
      lat: 9.93040049002793,
      lng: -84.09062837772197
  };
  markerOptions: google.maps.MarkerOptions = { draggable: false, clickable: true, animation: google.maps.Animation.DROP};
  markerPositions: google.maps.LatLngLiteral[] = [];


  constructor(private petService: PetService, private media: MediaService,private _notificationSvc: NotificationService, private router: Router, private formBuilder: FormBuilder) {
      this.petLogged = this.petService.getLocalPet()
      this.pet = JSON.parse(this.petLogged);
      if(this.pet != null){
      }else{
        this.router.navigate(['/home']);
        localStorage.clear();
        return;
      }
  }    

    ngOnInit() {
      this.getAllUsers();
    }

    getAllUsers() {
      this.petService.getLocationPetsList().subscribe(data => {
          this.users = data;

          const dataoptions: any = []

          this.users.forEach(element => {

            const icon = {
              url: element.photo, // url
              scaledSize: new google.maps.Size(30, 30), // scaled size
              origin: new google.maps.Point(0,0), // origin
              anchor: new google.maps.Point(0, 0) // anchor
          };

            dataoptions.push({
              data: element,
              position: {
                lat: parseFloat(element.lat),
                lng: parseFloat(element.lng),
              },
              label: {
                color: 'red',
                text: 'Marker label ' + (this.markers.length + 1),
              },
              title: 'maps-icon',
              options: { animation: google.maps.Animation.DROP, icon: icon },
            });
          });

          this.points = dataoptions;
      },
      error => {
        this.loading = false;
        this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor de revisar get all users', 6000);
      });
    }

    showPanel(item: any) {
      item.showPanel = !item.showPanel;
    }  

    openInfo(windowIndex: number, content: any) {
      this.markers.forEach((marker: MapMarker, ix: number) => {
          if (windowIndex === ix) {
              this.dataContent = content.data;
              this.infoWindow.open(marker);
          }
      });
    }
  
}


export class PointMap {
  title: string;
  label: any;
  position: Position; // {lat, lng} object - in accordance to the API
  options: any;
}
 export class Position {
  lat: number;
  lng: number;
 }