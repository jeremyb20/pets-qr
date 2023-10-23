import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-term-and-conditions',
  templateUrl: './term-and-conditions.component.html',
  styleUrls: ['./term-and-conditions.component.scss']
})
export class TermAndConditionsComponent implements OnInit {
  websiteName: string = ''
  constructor() { }

  ngOnInit(): void {
    this.websiteName = 'Plaquitas para mascotas CR'
  }

}
