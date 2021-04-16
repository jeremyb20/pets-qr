import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MediaResponse, MediaService } from 'src/app/common/services/media.service';
import { NotificationService } from 'src/app/common/services/notification.service';
import { PetService } from 'src/app/common/services/pet.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';

declare var $: any;


@Component({
  selector: 'app-new-qrpets',
  templateUrl: './new-qrpets.component.html',
  styleUrls: ['./new-qrpets.component.scss']
})
export class NewQRPetsComponent implements OnInit {
  public AngularxQrCode: string = null;
  private mediaSubscription: Subscription;
  Media: MediaResponse;
  allNewCodes: any;
  filteredData: any;
  query: any;
  query1: any;
  query2: any;
  petLogged: any;
  pet : any;
  loading: boolean = false;
  submitted = false;
  showPetSecondArray: any;

  constructor(private petService: PetService, private media: MediaService,private _notificationSvc: NotificationService, private router: Router, private formBuilder: FormBuilder) {
    this.petLogged = this.petService.getLocalPet()
    this.pet = JSON.parse(this.petLogged);
    if(this.pet != null){
      //console.log('Se cayo el sistema')
    }else{
      this.router.navigate(['/home']);
      localStorage.clear();
      return;
    }
    this.mediaSubscription = this.media.subscribeMedia().subscribe(media => {
      this.Media = media;
    });
    this.AngularxQrCode = 'Initial QR code data string';
    this.getNewCodes();
  }

  ngOnInit(){
  }



  getNewCodes() {
    this.petService.getNewCodes().subscribe(data => {
        this.allNewCodes = data;
        this.filteredData = this.allNewCodes;
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor de revisar get all users', 6000);
    });
  }

  checkQrCode(link:any){
    $('#qrCodeInfoDialog').modal('show');
    this.AngularxQrCode = link;
  }

  deleteCode(item:any){
    Swal.fire({
      title: 'Estás seguro?',
      text: "No serás capaz de revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.petService.deletePet(item.idPet).subscribe(data => {
          if(data.success) {
              Swal.fire(
                'Eliminado!',
                'Este usuario ha sido eliminado.',
                'success'
              )
              this.getNewCodes();
              this.loading = false;
          } else {
            Swal.fire({
              position: 'center',
              icon: 'error',
              title: 'Oops...',
              text: 'Ha ocurrido un problema, favor de revisar',
              confirmButtonText: 'OK',
            })
          }
        },
        error => {
          this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
        });
      }
    })
  }
  
  makeid(length) {
    var result = [];
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result.push(characters.charAt(Math.floor(Math.random() *
        charactersLength)));
    }
    return result.join('');
}

  generateCode() {
    
    var title = 'Agregar Nuevo Codigo?'
    Swal.fire({
        title: title,
        showCancelButton: true,
        confirmButtonText: `Ok`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          this.loading = true;
          var newCode = {
            isActivated: true,
            randomCode: this.makeid(6)
          }
          
          this.petService.registerNewCode(newCode).subscribe(data => {
            if(data.success) {
                Swal.fire(
                  'Resgistrado!',
                  'Se ha registrado nuevo codigo.',
                  'success'
                )
                this.loading = false;
                $('#addNewProductModal').modal('hide');
                this.getNewCodes();
            } else {
              Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Oops...',
                text: 'Ha ocurrido un problema, favor de revisar',
                confirmButtonText: 'OK',
              })
              $('#addNewProductModal').modal('hide');
              this._notificationSvc.warning('Hola '+this.pet.petName+'', data.msg, 6000);
            }
          },
          error => {
            this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor contactar a soporte o al administrador del sitio', 6000);
          });

          Swal.fire('Saved!', '', 'success')
        } else if (result.isDenied) {
          Swal.fire('Cambios no ha sido guardados', '', 'info')
        }
      })
    
  }

  filterData(query,query1,query2): any[] {
    if (!query|| !query1 || !query2) {
      this.filteredData = this.allNewCodes;
    }
    
    if(this.filteredData != undefined){
      if(query){
        this.filteredData = this.filteredData.filter(obj => {
            if (!query) {
                return obj;
            }
            return obj.randomCode.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        });
      }

      if(query1){
        this.filteredData = this.filteredData.filter(obj => {
            if (!query1) {
                return obj;
            }
            return obj.link.toLowerCase().indexOf(query1.toLowerCase()) !== -1;
        });
      }

      if(query2){
        this.filteredData = this.filteredData.filter(obj => {
            if (!query2) {
                return obj;
            }
            return obj.idPet.toLowerCase().indexOf(query2.toLowerCase()) !== -1;
        });
      }
    }
    return this.filteredData;
  }
}
