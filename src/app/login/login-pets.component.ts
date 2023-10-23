import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserState } from 'src/app/common/constants/constants';
import { Router } from '@angular/router';
import { PetService } from 'src/app/common/services/pet.service';

@Component({
  selector: 'app-login-pets',
  templateUrl: './login-pets.component.html',
  styleUrls: ['./login-pets.component.scss']
})
export class LoginPetsComponent implements OnInit {
  public showPassword: boolean;
  loginForm: FormGroup;
  email: string;
  password: string;
  submitted = false;
  loading: boolean = false;
  hideMsg: boolean = false; 
  ShowMsg: string;
  timeSeconds: number =  6000;
  UserState = UserState
  constructor(
    private _petService: PetService,
    private formBuilder: FormBuilder,
    private router: Router) { }

  ngOnInit() {
    this.loginForm =  this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }
  get f() { return this.loginForm.controls; }

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

    this._petService.authenticatePet(pet).subscribe({
      next: (data: any) => {
        if (data.success) {
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
          this._petService.storeUserData(data.token, data.pet);
          this._petService.storePrincipalUserData(data.pet);
          this._petService.setidTrack(1)
        } else {
          this.hideMsg = true;
          this.ShowMsg = data.msg;
          this.loading = false;
          setTimeout(() => { this.hideMsg = false }, this.timeSeconds);
        }
      },
      error: (err: any) => {
        console.log(err);
        this.loading = false;
        this.hideMsg = true;
        this.ShowMsg = 'Servicio en mantenimiento, favor de iniciar sesión más tarde';
        setTimeout(() => { this.hideMsg = false }, 10000);
      }
    });
  }
}
