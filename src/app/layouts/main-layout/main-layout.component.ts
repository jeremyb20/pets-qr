import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { TimeoutSeconds } from '../../common/constants/constants';
import { NotificationService } from '../../common/services/notification.service';
import { TokensService } from '../../common/services/tokens.service';
import { AuthServices } from 'src/app/common/services/auth.service';
import { Router } from '@angular/router';
import { MediaResponse, MediaService } from 'src/app/common/services/media.service';
import { PetService } from 'src/app/common/services/pet.service';
declare var $: any;

@Component({
  	selector: 'app-main-layout',
	templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
    private httpSubscription: Subscription;
    private showLoadingSubscription: Subscription;    
    private idleEndSubscription: Subscription;
    private timeoutSubscription: Subscription;
    private warningSubscription: Subscription;
    private isWarning: boolean = false;
    private  mediaSubscription: Subscription;
    Media: MediaResponse;
    errMsg: string = "Please click HOME to refresh.";
    hideMsg: boolean = true;
    countdown: number = 0;
    countPct: number = 100;
    loading: boolean = false;
    lastTick: number;
    userLogged: any;
    user:any;
    petNameLogged: string;

  	constructor(private router: Router, private authService: AuthServices, private _petService: PetService,  private media: MediaService, private notification: NotificationService, private tokenSvc: TokensService) { 
        this.httpSubscription = this.notification.onHttpError().subscribe((result) => {
			  this.onAuthRequired(result);
        });
        this.showLoadingSubscription = this.notification.onShowLoading().subscribe((result) => {
			    this.loading = result;
        });

        this.mediaSubscription = this.media.subscribeMedia().subscribe(media => {
            this.Media = media;
            if (media.IsMobile) {
                setTimeout(() => { $("#wrapper").removeClass("toggled"); }, 1);
            }
        });
        this.userLogged = this.authService.getLocalUser();
        if(this.userLogged == null ){
            this.userLogged = this._petService.getLocalPet();
        }
        this.user = JSON.parse(this.userLogged);
        if(this.user!= null)
        this.petNameLogged = (this.user.petName == null)? this.user.companyName: this.user.petName;

        $(function(){
          $("#menu-toggle").click(function(e) {
            e.preventDefault();
            $("#wrapper").toggleClass("toggled");
          });
        });

        setInterval(() => { this.detectWakeFromSleep(), 800 });    
        //idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
        this.countPct = 100;

        /*this.idleStartSubscription = idle.onIdleStart.subscribe(() => {
            console.log('You\'ve gone idle!');
        });*/

       
    }

  	ngOnInit() { 
        if(this.Media.IsMobile){
           $("#wrapper").removeClass("toggled");
        }
    }    

    onAuthRequired(result: number) {
        if (result == 200)
            this.hideMsg = true;
        else
            this.hideMsg = false;
        if (result == 401) {
            this.errMsg = 'Your session has expired!';
            setTimeout(() => { this.logout() }, 1500);
        }
    }

    goHome(){
        // $('#wrapper').removeClass('toggled')
        if(this.user.userState == 0 ){
          this.router.navigate(['/admin'])
        }
    
        if(this.user.userState == 3 ){
          if(this.Media.IsMobile){
            $('#wrapper').removeClass('toggled');
          }
            
          this.router.navigate(['/dashboard-pet']);
        }
    }

    gotoSomewhere(val){
        this._petService.setidTrack(val);
        if(val == 2){
            this.router.navigate(['/calendar-pets']);
            setTimeout(() => { location.reload(); }, 500);
        }
        $('#wrapper').removeClass('toggled');
    }

    hide(){
        $('#wrapper').removeClass('toggled');
    }

    detectWakeFromSleep() {
        let now = new Date().getTime();
        let delta = now - this.lastTick;
        if (delta > 60 * 1000) {
            $('#TimeOut-Modal').modal('hide');
            $('.modal').modal('hide');
            //this.idle.stop();
            this.tokenSvc.processToken(true);
        }
        this.lastTick = now;
    }


    logout(){
      this.authService.logout();
      this.router.navigate(['/home']);
    }

    ngOnDestroy() {
        if (this.httpSubscription)
            this.httpSubscription.unsubscribe();        
        if (this.idleEndSubscription)
            this.idleEndSubscription.unsubscribe();
        if (this.timeoutSubscription)
            this.timeoutSubscription.unsubscribe();
        if (this.warningSubscription)
            this.warningSubscription.unsubscribe();
        if (this.showLoadingSubscription)
            this.showLoadingSubscription.unsubscribe();
        if(this.mediaSubscription)
            this.mediaSubscription.unsubscribe();
	}
}
