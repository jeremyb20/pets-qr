import { Component, ElementRef, NgZone, OnInit, ViewChild,Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MustMatch } from '../common/helpers/must-match.validator';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { PetService } from 'src/app/common/services/pet.service';
import { UploadEvent } from './register-response';
import { MediaResponse, MediaService } from '../common/services/media.service';
import { Subscription } from 'rxjs';
declare var $: any;

interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

@Component({
  selector: 'app-register-pets',
  templateUrl: './register-pets.component.html',
  styleUrls: ['./register-pets.component.scss']
})
export class RegisterPetComponent implements OnInit {
  mediaSubscription: Subscription;
  Media: MediaResponse;

  showPassword: boolean = false;
  showPassword2: boolean = false;
  loading: boolean = false;
  submitted: boolean = false;
  registerForm: FormGroup;

  zoom: number = 17;
  lat: number = 9.93040049002793;
  lng: number = -84.09062837772197;
  markers: marker[] = [];
  showInfo: boolean = true;
  hideMsg: boolean = false; 
  getLinkIdParam: null;
  getLinkIdSecondaryParams: null;
  isActivated: boolean;
  ShowMsg: string;
  timeSeconds: number =  6000;
  file : File;
  photoSelected: any | ArrayBuffer;
  uploadedFiles: any[] = [];
  genderType: any = [];
  showInputCode: boolean = false;
  isSetPosition: boolean = false;

  
  constructor(
    private formBuilder: FormBuilder,
    private _petService: PetService, 
    private router: Router, 
    private route: ActivatedRoute, private _mediaService: MediaService ) {

    this.mediaSubscription = this._mediaService.subscribeMedia().subscribe(media => {
      this.Media = media;
    });

    if(this.getLinkIdParam == undefined) {
      this.route.queryParams.subscribe(params => {
        this.getLinkIdParam = params.id;
        this.getLinkIdSecondaryParams = params.idSecond;
        this.isActivated = Boolean(params.isActivated);
        this.showInputCode = (this.getLinkIdParam == undefined) ? false : true;
      });
    }
  }

  ngOnInit() {
    this.genderType = [
      {Id: 1, gender: 'Macho'},
      {Id: 2, gender: 'Hembra'}
    ];

    this.registerForm = this.formBuilder.group({
      petName: ['', Validators.required],
      codeGenerator: ['', Validators.required],
      genderSelected: ['', Validators.required],
      phone: new FormControl('', [Validators.required, Validators.minLength(6),Validators.pattern(/\d/)]),
      email: ['', [Validators.required, Validators.email]],
      password:  new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      acceptTerms: [false, Validators.requiredTrue]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
    
    if(!this.showInputCode){
      var inputName = this.registerForm.get('codeGenerator');
      inputName?.setValidators(null);
      inputName?.updateValueAndValidity();
    }
  }
  get f() { return this.registerForm.controls; }

  processFile(event: any): void {
    for(let file of event.currentFiles) {
      this.uploadedFiles = file;
      if(this.uploadedFiles){
        this.file = <File>event.files[0];
        if(this.file.type == String('image/png') || this.file.type == String('image/jpg') || this.file.type == String('image/jpeg') ){
          const reader = new FileReader();
  
          reader.onload = e => this.photoSelected = reader.result;
          reader.readAsDataURL(this.file);
        }else{
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Oops...',
            text: 'Solo se permite formatos JPG, PNG, JPEG',
            confirmButtonText: 'OK',
          })
        }
      }
    }
  }

  onSubmit() {
      this.submitted = true;
      // stop here if form is invalid
      if (this.registerForm.invalid) {
          return;
      }
      if(this.file != undefined){
        this.loading = true;
        const data = this.returnObjectData(this.showInputCode);
        this._petService.registerPet(data).subscribe({
          next: (data: any) => {
            if(data.success){
              this.loading = false;
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Registro de ' + this.f.petName.value + ' exitoso',
                html: data.msg,
                confirmButtonText: 'OK',
              })
              .then((result) => {
                  if (result.value){
                    this.router.navigate(['/login-pets']); 
                  }
                    
              });
            }else{
              this.hideMsg = true;
              this.loading = false;
              this.ShowMsg = data.msg;
              setTimeout(() => { this.hideMsg = false }, this.timeSeconds);
            }
          },
          error: (err: any) => {
            console.log(err);
            this.hideMsg = true;
            this.loading = false;
            this.ShowMsg = "Ocurrio un error favor contactar a soporte o al administrador del sitio";
            setTimeout(() => { this.hideMsg = false }, this.timeSeconds);
          }
        });
      }else{
        Swal.fire({
          title: 'Campo requerido' ,
          html: "Favor de ingresar una foto para " + this.f.petName.value,
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
        .then((result) => { });
      }
  }

  returnObjectData(key:boolean){
    switch (key) {
      case true: return {
        petName: this.f.petName.value,
        phone: this.f.phone.value,
        email: this.f.email.value.toLowerCase(),
        password: this.f.password.value,
        acceptTerms: this.f.acceptTerms.value,
        genderSelected: this.f.genderSelected.value,
        userState: 3,
        petStatus: 'No-Perdido',
        isActivated: this.showInputCode,
        photo: this.file 
      }

      case false: return {
        _id: this.getLinkIdParam,
        idSecond: this.getLinkIdSecondaryParams,
        codeGenerator: this.f.codeGenerator.value,
        petName: this.f.petName.value,
        phone: this.f.phone.value,
        email: this.f.email.value.toLowerCase(),
        password: this.f.password.value,
        acceptTerms: this.f.acceptTerms.value,
        genderSelected: this.f.genderSelected.value,
        userState: 3,
        petStatus: 'No-Perdido',
        isActivated: this.showInputCode,
        photo: this.file
      }
    
      default: return null;
    }
  }

  showPoliticPrivacy(){
    $('#termsandcondition').modal('show');
  }

  onReset() {
      this.submitted = false;
      this.registerForm.reset();
  }


}
interface marker {
	lat: number;
	lng: number;
	label?: string;
  draggable: boolean;
  photo?: any;
}
