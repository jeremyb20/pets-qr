import { Component, OnInit, HostListener} from '@angular/core';
import { Router } from '@angular/router';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PetService } from '../common/services/pet.service';
import { NotificationService } from '../common/services/notification.service';
import { MediaService, MediaResponse } from '../common/services/media.service';
import { Subscription } from 'rxjs';
declare var $ :any;


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private mediaSubscription: Subscription;
  Media: MediaResponse;
  loginForm: FormGroup;
  email: string;
  password: string;
  submitted = false;
  loading: boolean = false;
  hideMsg: boolean = false; 
  ShowMsg: string;
  timeSeconds: number =  3000;
  query: string;
  allUsersData: any;
  filteredData: any;
  imageUrl: any;
  elementDiv :any
  isShow: boolean;
  topPosToStartShowing = 100;

  constructor(
    private petService: PetService,
    private media: MediaService,
    private _notificationSvc: NotificationService,
    private formBuilder: FormBuilder,
    private router: Router) {
      this.mediaSubscription = this.media.subscribeMedia().subscribe(result => {
        this.Media = result;
      });
    }

  ngOnInit() {
    this.loginForm =  this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.getAllUsers();
  }
  get f() { return this.loginForm.controls; }

  @HostListener('window:scroll',['$event'])

  divScroll(e, isClicked) {
    if(isClicked){
      e.srcElement.scrollTop =0;
    }
    this.elementDiv = e;
    if (e.target.scrollTop >= this.topPosToStartShowing) {
      this.isShow = true;
    } else {
      this.isShow = false;
    }
  }

  // TODO: Cross browsing
  gotoTop() {
    this.elementDiv.srcElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;
    const pet = {
      email: this.f.email.value,
      password: this.f.password.value
    }

    this.petService.authenticatePet(pet).subscribe(data => {
        if(data.success) {
        this.loading = false;
          switch (data.pet.userState) {
            case 0:
              this.router.navigate(['/admin']);
              break;
            case 3:
              this.router.navigate(['/dashboard-pet']);
            break;
          
            default:
              break;
          }
          this.petService.storeUserData(data.token, data.pet);
        } else {
          this.hideMsg = true;
          this.ShowMsg = data.msg;
          this.loading = false;
          setTimeout(() => { this.hideMsg = false }, this.timeSeconds);
        }
    });
  }

  getAllUsers() {
    this.petService.getPetsLostList().subscribe(data => {
        this.allUsersData = data;
        this.filteredData = this.allUsersData;
        // this.imageUrl = this.profile.photo;
    },
    error => {
    this.loading = false;
    this._notificationSvc.warning('Hola'+',', 'Ocurrio un error favor DE REVISAR', 6000);
    });
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


}
