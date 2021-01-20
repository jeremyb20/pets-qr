import { Component, ElementRef, NgZone, OnInit, ViewChild, OnDestroy, Input, AfterContentInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CalendarOptions } from '@fullcalendar/angular'; // useful for typechecking
import { Subscription, from } from 'rxjs';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { MediaResponse, MediaService } from '../../common/services/media.service';
import { darkStyle, lightStyle } from '../../common/constants/map-theme';
import * as moment from 'moment';
import { PetService } from 'src/app/common/services/pet.service';
import { NotificationService } from 'src/app/common/services/notification.service';
import { Router } from '@angular/router';
import esLocale from '@fullcalendar/core/locales/es';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import { MapsAPILoader } from '@agm/core';
import {Location} from '@angular/common';

declare var $: any;

interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

@Component({
  selector: 'app-dashboard-pet',
  templateUrl: './dashboard-pet.component.html',
  styleUrls: ['./dashboard-pet.component.scss']
})
export class DashboardPetComponent implements OnInit {
  @Input() age;
  private mediaSubscription: Subscription;
  petLogged: any;
  pet : any;
  profile: any;
  Media: MediaResponse;
  newPetInfoForm: FormGroup;
  newEventForm: FormGroup;
  submitted = false;
  loading: boolean = false;
  loadingQr: boolean = false;
  file : File;
  photoSelected: String | ArrayBuffer;
  hideMsg: boolean = true;
  ShowMsg: string = 'hola';
  code: any;
  id: number = 1;

// calendar 

isNewEvent: boolean = false;
events: any;
calendarOptions: CalendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin],
  initialView: 'dayGridMonth',
  locale: esLocale,
  headerToolbar: {
    left: 'prev,next',
    center: '',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Dia',
    list: 'Lista'
  },
  dateClick: this.handleDateClick.bind(this,true), // bind is important!
  events: [],
  validRange: {
    start: new Date()
  },
  eventClick: this.handleDateClick.bind(this, false)
};

  private localUserSubscription : Subscription;
  public searchControl: FormControl;
  zoom: number = 17;
  lat: number;
  lng: number;
  distance: number;
  previous;
  coords: any;
  located: boolean;
  end_address: string;
  duration: string;
  start_address: string;
  showInfo: boolean = true;
  addDestiny: boolean = false;
  generate: boolean = false;
  getTrack: boolean = false;
  showInfoFinal: boolean = false;
  trackingRoute: boolean = false;
  markers: marker[] = [];
  confirmData: any;
  origin : any;
  destination : any;

  currentTimer: any;

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

  @ViewChild("search")
  public searchElementRef: ElementRef;
  
  constructor(private petService: PetService, private media: MediaService, private formBuilder: FormBuilder, private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, private _location: Location, private _notificationSvc: NotificationService, private router: Router) {
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

    this.getPetDataList();
  }

  get g() { return this.newPetInfoForm.controls; }
  get f() { return this.newEventForm.controls; }

  ngOnInit() {
    this.newEventForm = this.formBuilder.group({
      title: ['', Validators.required],
      date: ['', [Validators.required]],
      enddate: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  stepTrackOrder(step: number){
    this.id = step;
  }

  getPetDataList() {
    this.petService.getPetDaList(this.pet.id).subscribe(data => {
      this.profile = data;
      this.code = '';
      this.newPetInfoForm = this.formBuilder.group({
        petName: [this.profile.petName, Validators.required],
        ownerPetName: [this.profile.ownerPetName, Validators.required],
        birthDate: [this.profile.birthDate, [Validators.required]],
        phone: [this.profile.phone, [Validators.minLength(8),Validators.required,Validators.pattern(/\d/)]],
        address: [this.profile.address, [Validators.required]],
        email: [this.profile.email, [Validators.required]],
        age: [this.profile.age, [Validators.minLength(0),Validators.required,Validators.pattern(/\d/)]],
        veterinarianContact: [this.profile.veterinarianContact, Validators.required],
        phoneVeterinarian: [this.profile.phoneVeterinarian, [Validators.minLength(8),Validators.required,Validators.pattern(/\d/)]],
        healthAndRequirements: [this.profile.healthAndRequirements, Validators.required],
        favoriteActivities: [this.profile.favoriteActivities, Validators.required],
      });
      
      if(this.code != undefined){
         this.code = data.code[0].status;
      }

      this.calendarOptions.events = data.calendar;

      this.markers.push({
        lat: this.profile.lat,
        lng: this.profile.lng,
        draggable: false,
        isDestination: false,
        photo: this.profile.photo
      });
      this.lat = this.profile.lat;
      this.lng = this.profile.lng;
      this.showInfo = true;
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }

  addNewPetInfoSubmit() {
    this.submitted = true;
    if (this.newPetInfoForm.invalid) {
      return;
    }
    this.loading = true;
    const pet = {
      petName: this.g.petName.value,
      _id: this.pet.id,
      ownerPetName: this.g.ownerPetName.value,
      birthDate: this.g.birthDate.value,
      address: this.g.address.value,
      email: this.g.email.value,
      age: this.g.age.value,
      veterinarianContact: this.g.veterinarianContact.value,
      phoneVeterinarian: this.g.phoneVeterinarian.value,
      healthAndRequirements: this.g.healthAndRequirements.value,
      favoriteActivities: this.g.favoriteActivities.value
    }

    this.petService.updatePetProfile(pet).subscribe(data => {
      if(data.success) {
        this._notificationSvc.success('Hola '+this.pet.petName+'', data.msg, 6000);
        this.loading = false;
        this.getPetDataList();
      } else {
        $('#newMenuModal').modal('hide');
        this.loading = false;
        this._notificationSvc.warning('Hola '+this.pet.petName+'', data.msg, 6000);
      }
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }


  AfterContentInit() {
    this.searchControl = new FormControl();
  }

  setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.zoom = 17;

        this.markers.push({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          draggable: false,
          isDestination: false,
          photo: this.pet.photo
        });
        this.showInfo = true;
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  mapClicked($event: MouseEvent) {
    var event: any;
    event = $event
    this.showInfo = true;
    this.zoom = 17;
    if(this.markers.length ==0 ){
      this.markers.push({
        lat: event.coords.lat,
        lng: event.coords.lng,
        draggable: false,
        isDestination: false,
        photo: "https://cdn.worldvectorlogo.com/logos/google-maps-2020-icon.svg"
      });
    }
  }

  changePosition(mPosition: any){
    this.showInfo = false;
    if (this.markers.length > 0) {
      this.markers.shift();
    }
  }

  savePosition() {
    this.showInfo = false;
    console.log(this.markers);
    var pet = {
      lat: this.markers[0].lat,
      lng: this.markers[0].lng,
      _id: this.pet.id
    }
    
    this.petService.updatePetLocation(pet).subscribe(data => {
      if(data.success) {
        this._notificationSvc.success('Hola '+this.pet.petName+'', data.msg, 6000);
        this.loading = false;
        this.getPetDataList();
      } else {
        $('#newMenuModal').modal('hide');
        this.loading = false;
        this._notificationSvc.warning('Hola '+this.pet.petName+'', data.msg, 6000);
      }
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });

  }

  // calendar 
  editCalendar(item:any) {
    console.log(item);
  }

  handleDateClick(isNew, arg) {
    $(function(){
      $('[type="date"]').prop('min', function(){
          return new Date().toJSON().split('T')[0];
      });
    });
    this.isNewEvent = isNew;
    if(this.isNewEvent){
      this.newEventForm = this.formBuilder.group({
        title: ['', Validators.required],
        date: [arg.dateStr, [Validators.required]],
        enddate: ['', Validators.required],
        description: ['', Validators.required],
      });
    }else{
      var start = moment(arg.event._instance.range.start).format("YYYY-MM-DD");
      var end = moment(arg.event._instance.range.end).format("YYYY-MM-DD");

      this.newEventForm = this.formBuilder.group({
        title: [arg.event._def.title, Validators.required],
        date: [start, [Validators.required]],
        enddate: [end, Validators.required],
      });
    }
    $('#newCalendarEventModal').modal('show');
  }

  newEventCalendarSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.newEventForm.invalid) {
        return;
    }
    this.loading = true;
    var newEvent = {
      title: this.f.title.value,
      date: this.f.date.value,
      enddate: this.f.enddate.value,
      description: this.f.description.value,
      _id: this.pet.id
    } 

    this.petService.registerNewPetEvent(newEvent).subscribe(data => {
      if(data.success) {
        $('#newCalendarEventModal').modal('hide');
        this._notificationSvc.success('Hola '+this.pet.petName+'', data.msg, 6000);
        this.loading = false;
        this.getPetDataList();
      } else {
        $('#newCalendarEventModal').modal('hide');
        this.loading = false;
        this._notificationSvc.warning('Hola '+this.pet.petName+'', data.msg, 6000);
      }
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }

  //Photo

  updatePhoto(){
    $('#updatePhotoModal').modal('show');
  }

  updatePhotoSubmit(){
    this.loading = true;
    this.petService.updatePhotoPetProfile(this.pet.id,this.file).subscribe(data => {
      if(data.success) {
        $('#updatePhotoModal').modal('hide');
        this._notificationSvc.success('Hola '+this.pet.petName+'', data.msg, 6000);
        this.loading = false;
        this.getPetDataList();
      } else {
        $('#updatePhotoModal').modal('hide');
        this.loading = false;
        this._notificationSvc.warning('Hola '+this.pet.petName+'', data.msg, 6000);
      }
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }

  processFile(event: HtmlInputEvent): void {

    if(event.target.files && event.target.files[0]){
      this.file = <File>event.target.files[0];

      const reader = new FileReader();

      reader.onload = e => this.photoSelected = reader.result;
      reader.readAsDataURL(this.file);
    }
  }
  
  // generate code qr

  generateQrCode() {
    this.loadingQr = true;
    var object = {
      id: this.pet.id,
      status: "Ordenando",
      petName: this.profile.petName
    }

    this.petService.generateQrCodePet(object).subscribe(data => {
      if(data.success) {
        Swal.fire({
          title: 'Solicitud de Codigo Qr exitoso' ,
          html: data.msg,
          icon: "success",
          allowEscapeKey: false,
          allowOutsideClick: false,
          position: 'top',
          customClass: { confirmButton: 'col-auto btn btn-info' }
        })
        .then((result) => {
          if (result.value){
            location.reload();
          }   
        });
      } else {
        $('#updatePhotoModal').modal('hide');
        this.loadingQr = false;
        this._notificationSvc.warning('Hola '+this.pet.petName+'', data.msg, 6000);
      }
    },
    error => {
      this.loadingQr = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }

  goToProfile() {
    this.router.navigate(['/myPetCode/'],{ queryParams: {id: this.pet.id}}); 
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
