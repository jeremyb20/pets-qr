import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MediaResponse, MediaService } from 'src/app/common/services/media.service';
import { NotificationService } from 'src/app/common/services/notification.service';
import { PetService } from 'src/app/common/services/pet.service';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver-es';

declare var $: any;


@Component({
  selector: 'app-pets-registered',
  templateUrl: './pets-registered.component.html',
  styleUrls: ['./pets-registered.component.scss']
})
export class PetsRegisteredComponent implements OnInit {
  private mediaSubscription: Subscription;
  public textValue: string = '';
  public AngularxQrCode: string = '';
  title = 'qr-code-test';
  imgURL = "";
  elem: any;

  Media: MediaResponse;
  allUsersData: any;
  filteredData: any;
  query: string;
  petLogged: any;
  pet : any;
  loading: boolean = false;
  showPetSecondArray: any;

  @ViewChild('qrCode', {static : false}) qrCode:any;

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
    this.textValue = 'Initial QR code data string';

    this.getAllUsers();
  }

  ngOnInit(): void {
  }

  getAllUsers() {
    this.petService.getPetsList().subscribe(data => {
        this.allUsersData = data;
        this.filteredData = this.allUsersData;
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola '+this.pet.petName+'', 'Ocurrio un error favor de revisar get all users', 6000);
    });
  }

  showSecondPet(item){
    this.showPetSecondArray = item.newPetProfile;
    $('#showPetModal').modal('show');
  }

  deleteUser(item:any){
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
              this.getAllUsers();
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

  deleteSecondPet(item:any){
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
        var remove = {
          _id: item._id,
          idItem: item.idPet
        }

        this.petService.deletePetProfile(remove).subscribe(data => {
          if(data.success) {
              Swal.fire(
                'Eliminado!',
                'Este usuario ha sido eliminado.',
                'success'
              )
              $('#showPetModal').modal('hide');
              this.getAllUsers();
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

  filterData(query): any[] {
    if (!query) {
      this.filteredData = this.allUsersData;
    }
    
    if(this.filteredData != undefined){
        this.filteredData = this.filteredData.filter(obj => {
            if (!query) {
                return obj;
            }
            return obj.email.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        });
    }
    return this.filteredData;
  }

  checkQrCode(link:any, idSecond:Number){
    $('#qrCodeInfoDialog').modal('show');
    const urlLink = `https://www.localpetsandfamily.com/myPetCode/${link}/${idSecond}`
    this.AngularxQrCode = urlLink;
    this.textValue = urlLink;

    setTimeout(() => { this.elem =  this.qrCode.qrcElement.nativeElement.children[0]; 
      let context = this.elem.getContext("2d");
  
      // create image
      let img = new Image();
      img.crossOrigin="anonymous";
      // img.src = this.imgURL;
      img.src = 'https://res.cloudinary.com/ensamble/image/upload/v1619212083/mihxx1tmm5bgjiukmw7r.png'
  
      // fixed sizes
      let iWidth = 70;
      let iHeight = 70;
      
      let _that = this; 
      img.onload = () => {
        context.drawImage(img, (this.elem.width/2) - (iWidth/2),(this.elem.height/2) - (iHeight/2), iWidth, iHeight);    
        // saveAs(_that.canvasToBlob(this.elem), "file.png");
      }
    }, 100);
    // this.createQRWithImage();
  }

  createQRWithImage(){
    // get canvas dom element
    setTimeout(() => { this.elem =  this.qrCode.qrcElement.nativeElement.children[0]; 
      let context = this.elem.getContext("2d");

      // create image
      let img = new Image();
      img.crossOrigin="anonymous";
      // img.src = this.imgURL;
      img.src = 'https://res.cloudinary.com/ensamble/image/upload/v1619212083/mihxx1tmm5bgjiukmw7r.png'

      // fixed sizes
      let iWidth = 70;
      let iHeight = 70;
      
      let _that = this; 
      img.onload = () => {
        context.drawImage(img, (this.elem.width/2) - (iWidth/2),(this.elem.height/2) - (iHeight/2), iWidth, iHeight);    
        saveAs(_that.canvasToBlob(this.elem), "file.png");
      }
    }, 100);
    // convert to canvas type
  }

   // adapted from: https://medium.com/better-programming/convert-a-base64-url-to-image-file-in-angular-4-5796a19fdc21
   canvasToBlob(canvas){
    let dataurl = canvas.toDataURL("image/png");
    let byteString = window.atob(dataurl.replace(/^data:image\/(png|jpg);base64,/, ""));
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([int8Array], { type: 'image/jpeg' });
  }

}
