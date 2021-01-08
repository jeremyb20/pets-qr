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
declare var $: any;
declare const google: any; 

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
  Media: MediaResponse;
  newPetInfoForm: FormGroup;
  submitted = false;
  loading: boolean = false;

  
  constructor(private petService: PetService, private media: MediaService, private formBuilder: FormBuilder, private _notificationSvc: NotificationService, private router: Router) {
    this.petLogged = this.petService.getLocalPet()
    this.pet = JSON.parse(this.petLogged);
    if(this.pet != null){
      switch (this.pet.userState) {
        case 0:
          this.router.navigate(['/admin-master']);
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
  }

  get g() { return this.newPetInfoForm.controls; }

  ngOnInit() {
    this.newPetInfoForm = this.formBuilder.group({
      petName: ['', Validators.required],
      date: ['', [Validators.required]],
      age: ['', [Validators.minLength(0),Validators.required,Validators.pattern(/\d/)]],
      veterinarianContact: ['', Validators.required],
      phoneVeterinarian: ['', Validators.required],
      healthAndRequirements: ['', Validators.required],
      favoriteActivities: ['', Validators.required],
    });
  }

  addNewPetInfoSubmit() {

  }

}
