import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SideMenuServiceService {
  private sideMenuState = new BehaviorSubject<boolean>(true);
  isSideMenuOpen$ = this.sideMenuState.asObservable();

  // Toggle side menu state
  toggleSideMenu(isOpen: boolean) {
    this.sideMenuState.next(isOpen);
  }
  constructor() { }
}
