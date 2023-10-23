import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { PetService } from '../common/services/pet.service';
import { NotificationService } from '../common/services/notification.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {

  elementDiv: any;
  isShow: boolean;
  topPosToStartShowing = 100;
  allProductsData: any;
  filteredProductData: any;
  loading: boolean = false;
  showSimple: boolean = false;
  showNeon: boolean = false;
  showMetal: boolean = false;

  
  constructor(@Inject(DOCUMENT) private document: any, private _petService: PetService, private _notificationSvc: NotificationService) {}

  ngOnInit(): void {
    this.getAllProductList();
  }


  getAllProductList() {
    this._petService.getAllShopProductList().subscribe(data => {
      this.allProductsData = data.listaCatalogos;
      this.allProductsData.forEach(element => {
        if (element.tagType === 'simple') {
          this.showSimple = true;
        }

        if (element.tagType === 'neon') {
          this.showNeon = true;
        }

        if (element.tagType === 'metal') {
          this.showMetal = true;
        }
      });
      this.filteredProductData = this.allProductsData;
    },
    error => {
      this.loading = false;
      this._notificationSvc.warning('Hola ' +  '' , 'Ocurrio un error favor de comunicar al administrador del sitio', 6000);
    });
  }

  filterProductData(query2): any[] {
    if (!query2) {
      this.filteredProductData = this.allProductsData;
    }

    if (this.filteredProductData != undefined) {
      this.filteredProductData = this.filteredProductData.filter(obj => {
        if (!query2) {
          return obj;
        }
        return obj.productName.toLowerCase().indexOf(query2.toLowerCase()) !== -1;
      });
    }
    return this.filteredProductData;
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
