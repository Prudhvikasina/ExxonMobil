import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  public user: any;
  public app: any;
  public layout: any;
  loginUrl: string;
  emptyMessageText: string;
  siteid: any;
  constructor(
  ) {
    // App Settings
    this.app = {
      name: 'CPRS',
      description: 'CPRS - APP',
      year: ((new Date()).getFullYear())
    };
    this.loginUrl = '/auth/login';
    this.emptyMessageText = 'No Record Found';
    // this.baseUrl = environment.baseUrlApi || 'api/';
  }

  setSiteId(siteid: any) {
    this.siteid = siteid;
  }





}
