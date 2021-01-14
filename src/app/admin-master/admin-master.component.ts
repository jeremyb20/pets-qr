import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-admin-master',
  templateUrl: './admin-master.component.html',
  styleUrls: ['./admin-master.component.scss']
})
export class AdminMasterComponent implements OnInit {
  id: number = 1;

  constructor() {
  }


  ngOnInit() {

  }

  stepTrackOrder(step: number){
    this.id = step;
  }



}
