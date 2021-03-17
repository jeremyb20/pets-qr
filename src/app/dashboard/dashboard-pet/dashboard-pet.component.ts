import { Component, ElementRef, NgZone, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
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
  newLostPetForm: FormGroup;
  registerForm: FormGroup;
  submitted = false;
  loading: boolean = false;
  loadingQr: boolean = false;
  file : File;
  photoSelected: String | ArrayBuffer;
  hideMsg: boolean = true;
  ShowMsg: string = 'hola';
  code: any;
  id: number;
  permissionData: any;
  permissionDataCopy: any;
  updatePermission: boolean = false;
  petStatusInfo: string;
  showReportForm: boolean = false;
  petStatus: string;
  photoPrincipalPet: string;
  eventsCalendar: any;
// calendar 

isNewEvent: boolean = false;
events: any;
idEventUpdate: any;
calendarOptions: CalendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin],
  initialView: 'dayGridMonth',
  locale: esLocale,
  headerToolbar: {
    left: 'prev,next',
    center: 'title',
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
  eventClick: this.handleDateClick.bind(this, false)
};

  private localUserSubscription : Subscription;
  public searchControl: FormControl;
  zoom: number = 17;
  lat: number = 9.93040049002793;
  lng: number = -84.09062837772197;
  distance: number;
  previous;
  coords: any;
  located: boolean;
  end_address: string;
  duration: string;
  start_address: string;
  showInfo: boolean = true;
  showInfoNewPet: boolean = true;
  addDestiny: boolean = false;
  generate: boolean = false;
  getTrack: boolean = false;
  showInfoFinal: boolean = false;
  trackingRoute: boolean = false;
  markers: marker[] = [];
  markersNewPet: marker[] = [];
  confirmData: any;
  origin : any;
  destination : any;
  FilteredPetStatus: any;
  bussinesType = [
    {Id: 1, gender: 'Macho'},
    {Id: 2, gender: 'Hembra'},
    {Id: 2, gender: 'Otro'}
  ];
  currentTimer: any;
  idSecondary: number = 0;

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
  seeAllProfile: any;
  petPrincipal: any;

  @ViewChild("search")
  public searchElementRef: ElementRef;
  
  constructor(private petService: PetService, private media: MediaService, private formBuilder: FormBuilder, private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, private _location: Location, private _notificationSvc: NotificationService, private router: Router) {
    this.petLogged = this.petService.getLocalPet()
    this.pet = JSON.parse(this.petLogged);
    this.idSecondary = this.pet.idSecond;
    var petPrincipal = this.petService.getPrincipalUserData();
    var idSelected = this.petService.getidTrack();
    this.id = parseInt(idSelected);
    this.stepTrackOrder(this.id);
    this.petPrincipal = JSON.parse(petPrincipal);
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
      if(this.Media.IsMobile){
        this.calendarOptions.headerToolbar = {
          left: 'prev,next',
            center: 'title',
            right: ''
        };
      }
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
  get h() { return this.newLostPetForm.controls; }
  get i() { return this.registerForm.controls; }

  ngOnInit() {
    this.newEventForm = this.formBuilder.group({
      title: ['', Validators.required],
      date: ['', [Validators.required]],
      enddate: ['', Validators.required],
      description: ['', Validators.required],
    });
  
    this.newLostPetForm = this.formBuilder.group({
      lastPlaceLost: ['', Validators.required],
      date: ['', [Validators.required]],
      descriptionLost: ['', Validators.required],
    });

    this.registerForm = this.formBuilder.group({
      petName: ['', Validators.required],
      genderSelected: ['Genero del Can', Validators.required],
      ownerPetName: ['', Validators.required],
      birthDate: ['', [Validators.required]],
      phone: ['', [Validators.minLength(8),Validators.required,Validators.pattern(/\d/)]],
      address: ['', [Validators.required]],
      email: ['', [Validators.required]],
      age: ['', [Validators.minLength(0),Validators.required,Validators.pattern(/\d/)]],
      veterinarianContact: ['', Validators.required],
      phoneVeterinarian: ['', [Validators.minLength(8),Validators.required,Validators.pattern(/\d/)]],
      healthAndRequirements: ['', Validators.required],
      favoriteActivities: ['', Validators.required],
      linkTwitter: [''],
      linkFacebook: [''],
      linkInstagram: [''],
    });

    this.FilteredPetStatus = [
      {Id: 0, Name:'No-Perdido'},
      {Id: 1, Name:'Perdido'}
    ];
    $('input[rel="txtTooltip"]').tooltip();
    $('input[rel="txtAgeTooltip"]').tooltip();
  }

  stepTrackOrder(step: number){
    this.id = step;
    this.petService.setidTrack(this.id);
  }

  getPetDataList() {
    this.petService.getPetDataList(this.pet.id, this.idSecondary).subscribe(data => {
      this.profile = data;
      // this.seeAllProfile = data.newPetProfile;
      // this.photoPrincipalPet = data.photo;
      this.petStatusInfo = this.profile.petStatus;
      this.showReportForm = (this.profile.petStatus == 'Perdido')? true: false;
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
        favoriteActivities: [this.profile.favoriteActivities],
        linkTwitter: [this.profile.linkTwitter = (this.profile.linkTwitter == 'null')? this.profile.linkTwitter = '': this.profile.linkTwitter],
        linkFacebook: [this.profile.linkFacebook = (this.profile.linkFacebook == 'null')? this.profile.linkFacebook = '': this.profile.linkFacebook],
        linkInstagram: [this.profile.linkInstagram = (this.profile.linkInstagram == 'null')? this.profile.linkInstagram = '': this.profile.linkInstagram],
      });

      let objectStored = {
        id: this.pet.id,
        idSecond: this.idSecondary,
        petName: this.profile.petName,
        photo: this.profile.photo,
        userState: this.profile.userState
      }
      this.petService.setstoreUserData(objectStored)  
      // if(this.profile.code != undefined)
      //   this.code = (this.profile.code.length> 0)? this.profile.code[0].status: '';
      this.markers = [];
      this.markers.push({
        lat: this.profile.lat,
        lng: this.profile.lng,
        draggable: false,
        isDestination: false,
        photo: this.profile.photo
      });
      this.getCalendarInfo();
      this.showInfo = true;
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }

  getCalendarInfo() {
    this.petService.getCalendarInfoService(this.pet.id, this.idSecondary).subscribe(data => {
      this.calendarOptions.events = data.calendar;
      this.eventsCalendar = data.calendar;
      this.getPermissionInfo();
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }

  getPermissionInfo() {
    this.petService.getPetPermissionsDataList(this.pet.id, this.idSecondary).subscribe(data => {
      this.updatePermission = false;
      this.permissionData = data.permissions[0];
      if(this.permissionData == undefined || this.permissionData.length<=0){
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
          showLocationInfo:true
        }
      }else{
        this.permissionData = data.permissions[0];
      }
      this.getPetProfileList()
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }

  getPetProfileList(){
    this.petService.getAllProfileList(this.petPrincipal.id).subscribe(data => {
      this.photoPrincipalPet = data.photo;
      this.seeAllProfile = data.newPetProfile;
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }

  changed(item:any) {
    this.updatePermission = true;
    this.permissionData = item;
  }
  
  updatePermissionList() {
    var object  = {
      id: this.pet.id,
      idSecondary: this.idSecondary,
      showPhoneInfo: this.permissionData.showPhoneInfo,
      showEmailInfo: this.permissionData.showEmailInfo,
      showLinkTwitter: this.permissionData.showLinkTwitter,
      showLinkFacebook: this.permissionData.showLinkFacebook,
      showLinkInstagram: this.permissionData.showLinkInstagram,
      showOwnerPetName: this.permissionData.showOwnerPetName,
      showBirthDate: this.permissionData.showBirthDate,
      showAddressInfo: this.permissionData.showAddressInfo,
      showAgeInfo: this.permissionData.showAgeInfo,
      showVeterinarianContact: this.permissionData.showVeterinarianContact,
      showPhoneVeterinarian: this.permissionData.showPhoneVeterinarian,
      showHealthAndRequirements: this.permissionData.showHealthAndRequirements,
      showFavoriteActivities: this.permissionData.showFavoriteActivities,
      showLocationInfo: this.permissionData.showLocationInfo
    }

    this.petService.updatePetPermissionInfo(object).subscribe(data => {
      if(data.success)
      this._notificationSvc.success('Hola '+this.pet.petName+'', data.msg, 6000);
      setTimeout(() => {location.reload() }, 3000);
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
      idSecond: this.idSecondary,
      ownerPetName: this.g.ownerPetName.value,
      birthDate: this.g.birthDate.value,
      address: this.g.address.value,
      email: this.g.email.value,
      age: this.g.age.value,
      veterinarianContact: this.g.veterinarianContact.value,
      phoneVeterinarian: this.g.phoneVeterinarian.value,
      healthAndRequirements: this.g.healthAndRequirements.value,
      favoriteActivities: this.g.favoriteActivities.value,
      linkTwitter: this.g.linkTwitter.value,
      linkFacebook: this.g.linkFacebook.value,
      linkInstagram: this.g.linkInstagram.value
    }

    this.petService.updatePetProfile(pet).subscribe(data => {
      if(data.success) {
        this._notificationSvc.success('Hola '+this.pet.petName+'', data.msg, 6000);
        this.loading = false;
        // this.getPetDataList();
        setTimeout(() => {location.reload() }, 3000);
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
    var pet = {
      lat: this.markers[0].lat,
      lng: this.markers[0].lng,
      idSecond: this.idSecondary,
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

  setCurrentNewPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.zoom = 17;
        
        this.markersNewPet.push({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          draggable: false,
          isDestination: false,
          photo: 'https://cdn.worldvectorlogo.com/logos/google-maps-2020-icon.svg'
        });

        this.showInfoNewPet = true;
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  mapClickedNewPet($event: MouseEvent) {
    var event: any;
    event = $event
    this.showInfoNewPet = true;
    this.zoom = 17;
    if(this.markersNewPet.length ==0 ){
      this.markersNewPet.push({
        lat: event.coords.lat,
        lng: event.coords.lng,
        draggable: false,
        isDestination: false,
        photo: "https://cdn.worldvectorlogo.com/logos/google-maps-2020-icon.svg"
      });
    }
  }
  
  changePositionNewPet(mPosition: any){
    this.showInfoNewPet = false;
    if (this.markersNewPet.length > 0) {
      this.markersNewPet.shift();
    }
  }

  savePositionNewPet() {
    this.showInfoNewPet = false;
  }

  // calendar 
  editCalendar(item:any) {
    this.isNewEvent = false;
    this.idEventUpdate = item._id;
    this.newEventForm = this.formBuilder.group({
      title: [item.title, Validators.required],
      date: [item.date, [Validators.required]],
      enddate: [item.enddate, Validators.required],
      description: [item.description, Validators.required]
    });
    $('#newCalendarEventModal').modal('show');
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
        description: ['', Validators.required],
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
      _id: this.pet.id,
      idSecond: this.idSecondary
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
  
  updateEventCalendarSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.newEventForm.invalid) {
        return;
    }
    this.loading = true;
    var updateEvent = {
      title: this.f.title.value,
      date: this.f.date.value,
      enddate: this.f.enddate.value,
      description: this.f.description.value,
      idEventUpdate: this.idEventUpdate,
      _id: this.pet.id,
      idSecond: this.idSecondary,
    } 

    this.petService.updateNewPetEvent(updateEvent).subscribe(data => {
      if(data.success) {
        $('#newCalendarEventModal').modal('hide');
        this._notificationSvc.success('Hola '+this.pet.petName+'', data.msg, 6000);
        this.loading = false;
        location.reload();
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
    this.petService.updatePhotoPetProfile(this.pet.id, this.idSecondary, this.file).subscribe(data => {
      if(data.success) {
        $('#updatePhotoModal').modal('hide');
        this._notificationSvc.success('Hola '+this.pet.petName+'', data.msg, 6000);
        this.loading = false;
        location.reload();
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

  goShopping() {
    this.router.navigate(['/shopping-cart']);
  }

  goToProfile() {
    this.router.navigate(['/myPetCode/'],{ queryParams: {id: this.pet.id, idSecond: this.idSecondary}}); 
  }

  reportProfile(){
    $('#reportProfileModal').modal('show');
  }

  changeLeagueOwner(e:any){
    this.showReportForm = (e == 0)? false : true;
  }

  sendPetStatusLost() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.newLostPetForm.invalid) {
        return;
    }
    this.loading = true;
    var form = {
      lastPlaceLost: this.h.lastPlaceLost.value,
      date: this.h.date.value,
      descriptionLost: this.h.descriptionLost.value,
      idSecondary: this.idSecondary,
      _id: this.pet.id
    } 
      
    var status =  {
      petStatus : (this.showReportForm)? 'Perdido' : 'No-Perdido',
      petName: this.profile.petName
    }
    this.petService.sendNewPetStatusEvent(form, status).subscribe(data => {
      if(data.success) {
        $('#reportProfileModal').modal('hide');
        this._notificationSvc.success('Hola '+this.pet.petName+'', data.msg, 6000);
        this.loading = false;
        this.getPetDataList();
      } else {
        $('#reportProfileModal').modal('hide');
        this.loading = false;
        this._notificationSvc.warning('Hola '+this.pet.petName+'', data.msg, 6000);
      }
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }

  updateReportStatus() {
    var status =  {
      petStatus : (!this.showReportForm)? 'No-Perdido' : 'Perdido',
      petName: this.profile.petName,
      _id: this.pet.id
    }

    this.petService.updatePetStatusReport(status).subscribe(data => {
      if(data.success) {
        $('#reportProfileModal').modal('hide');
        this._notificationSvc.success('Hola '+this.pet.petName+'', data.msg, 6000);
        this.loading = false;
        this.getPetDataList();
      } else {
        $('#reportProfileModal').modal('hide');
        this.loading = false;
        this._notificationSvc.warning('Hola '+this.pet.petName+'', data.msg, 6000);
      }
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
    });
  }

  // register pet

  newPetRegister(){
    this.registerForm = this.formBuilder.group({
      petName: ['', Validators.required],
      genderSelected: ['Genero del Can', Validators.required],
      ownerPetName: [this.profile.ownerPetName, Validators.required],
      birthDate: ['', [Validators.required]],
      phone: [this.profile.phone, [Validators.minLength(8),Validators.required,Validators.pattern(/\d/)]],
      address: [this.profile.address, [Validators.required]],
      email: [this.profile.email, [Validators.required]],
      age: ['', [Validators.minLength(0),Validators.required,Validators.pattern(/\d/)]],
      veterinarianContact: ['', Validators.required],
      phoneVeterinarian: ['', [Validators.minLength(8),Validators.required,Validators.pattern(/\d/)]],
      healthAndRequirements: ['', Validators.required],
      favoriteActivities: ['', Validators.required],
      // linkTwitter: [this.profile.linkTwitter = (this.profile.linkTwitter == 'null')? this.profile.linkTwitter = '': this.profile.linkTwitter],
      // linkFacebook: [this.profile.linkFacebook = (this.profile.linkFacebook == 'null')? this.profile.linkFacebook = '': this.profile.linkFacebook],
      // linkInstagram: [this.profile.linkInstagram = (this.profile.linkInstagram == 'null')? this.profile.linkInstagram = '': this.profile.linkInstagram],
    });

    this.setCurrentNewPosition();

    $('#newPetModal').modal('show');
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.registerForm.invalid) {
        return;
    }
    if(this.i.genderSelected.value  === 'Genero del Can'){
      Swal.fire({
        title: 'Error de registro' ,
        html: "Seleccione el Genero del Can",
        showCancelButton: false,
        allowEscapeKey: false,
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        buttonsStyling: false,
        reverseButtons: true,
        position: 'top',
        padding: 0,
        customClass: { confirmButton: 'col-auto btn btn-info m-3' }
      })
      .then((result) => {
            
      });
      return;
    }
    
    this.loading = true;
    var newPet = {
      petName: this.i.petName.value,
      phone: this.i.phone.value,
      email: this.i.email.value,
      lat: this.markersNewPet[0].lat,
      lng: this.markersNewPet[0].lng,
      genderSelected: this.i.genderSelected.value,
      userState: 3,
      petStatus: 'No-Perdido',
      ownerPetName: this.i.ownerPetName.value,
      birthDate: this.i.birthDate.value,
      address: this.i.address.value,
      age: this.i.age.value,
      veterinarianContact: this.i.veterinarianContact.value,
      phoneVeterinarian: this.i.phoneVeterinarian.value,
      healthAndRequirements: this.i.healthAndRequirements.value,
      favoriteActivities: this.i.favoriteActivities.value,
      // linkTwitter: this.i.linkTwitter.value,
      // linkFacebook: this.i.linkFacebook.value,
      // linkInstagram: this.i.linkInstagram.value,
      _id: this.pet.id,
    }

    this.petService.registerNewPetByUserPet(newPet,this.file).subscribe(data => {
      if(data.success) {
        this.loading = false;
        Swal.fire({
          title: 'Registro ' + newPet.petName+'' ,
          html: data.msg + ' Su inicio de sesion va a ser por el mismo correo que se registró',
          showCancelButton: false,
          allowEscapeKey: false,
          confirmButtonText: 'OK',
          allowOutsideClick: false,
          buttonsStyling: false,
          reverseButtons: true,
          position: 'top',
          padding: 0,
          customClass: { confirmButton: 'col-auto btn btn-info m-3' }
        })
        .then((result) => {
          if (result.value){
            $('#newPetModal').modal('hide');
            this.router.navigate(['/dashboard-pet']); 
          }
              
        });
      } else {
        this.hideMsg = true;
        this.loading = false;
        this.ShowMsg = data.msg;
        setTimeout(() => { this.hideMsg = false }, 3000);
      }
    },
    error => {
      this.hideMsg = true;
      this.loading = false;
      this.ShowMsg = "Ocurrio un error favor contactar a soporte o al administrador del sitio";
      setTimeout(() => { this.hideMsg = false }, 3000);
    });
  }

  changeProfilePet() {
    $('#changeProfileModal').modal('show');
  }

  profileSelected(val:any){
    if(val != 1){
      this.idSecondary = val.id
      this.pet.id = this.petPrincipal.id
      this.getPetDataList();
    }else{
      this.idSecondary = this.petPrincipal.idSecond
      this.pet.id = this.petPrincipal.id
      this.getPetDataList();
    }
    $('#changeProfileModal').modal('hide');
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
