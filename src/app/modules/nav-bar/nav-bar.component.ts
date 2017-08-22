import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {MenuItem} from "primeng/components/common/api";

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  private _items: MenuItem[];
  private _activeItem: MenuItem;

  isDataSelection = false;
  isExport = false;

  constructor(private router: Router) {
  }

  ngOnInit() {
    this._items = [
      {label: 'Data Selection', routerLink: '/data-selection'},
      {label: 'Export', routerLink: '/export'}
    ];
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let whichStep = event.urlAfterRedirects.split('/')[1].split('#')[0];
        this.updateNavbar(whichStep);
      }
    });
  }

  updateNavbar(whichStep: string) {
    this.isDataSelection = (whichStep === 'data-selection' || whichStep === '');
    this.isExport = (whichStep === 'export');

    if (this.isDataSelection) {
      this._activeItem = this._items[0];
    } else if (this.isExport) {
      this._activeItem = this._items[1];
    }
  }

  get items(): MenuItem[] {
    return this._items;
  }

  set items(value: MenuItem[]) {
    this._items = value;
  }

  get activeItem(): MenuItem {
    return this._activeItem;
  }

  set activeItem(value: MenuItem) {
    this._activeItem = value;
  }
}

