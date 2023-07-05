import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {

  elementDiv: any;
  isShow: boolean;
  topPosToStartShowing = 100;


  
  constructor(@Inject(DOCUMENT) private document: any) {
    console.log(window.scrollY)
  }

  ngOnInit(): void {
  }

  @HostListener('window:scroll', ['$event'])

  divScroll(e, isClicked) {
    if (isClicked) {
      e.srcElement.scrollTop = 0;
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


}
