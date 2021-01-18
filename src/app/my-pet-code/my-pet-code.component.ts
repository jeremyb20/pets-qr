import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PetService } from 'src/app/common/services/pet.service';
import { NotificationService } from 'src/app/common/services/notification.service';
import { Router,ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-my-pet-code',
  templateUrl: './my-pet-code.component.html',
  styleUrls: ['./my-pet-code.component.scss']
})
export class MyPetCodeComponent implements OnInit {
  getLinkIdParam: null;
  zoom: number = 12;
  lat: number = 9.93040049002793;
  lng: number = -84.09062837772197;
  markers: marker[] = [];
  profile: any;
  showInfo: boolean = false;
  loading: boolean = false;

  constructor(private formBuilder: FormBuilder, private petService: PetService,private _notificationSvc: NotificationService, private route: ActivatedRoute , private router: Router) {
    this.route.params.subscribe(params => {
      this.getLinkIdParam = params.id; 
    });
    this.getPetDataList();
   }

  ngOnInit() {
  }

  getPetDataList() {
    this.petService.getPetDaList(this.getLinkIdParam).subscribe(data => {
      this.profile = data;
      this.markers.push({
        lat: this.profile.lat,
        lng: this.profile.lng,
        draggable: false,
        isDestination: false,
        photo: this.profile.photo
      });
      this.showInfo = true;
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.profile.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
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
