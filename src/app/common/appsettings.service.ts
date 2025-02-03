import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppsettingsService {

  public user: any;
  public app: any;
  public layout: any;
  loginUrl: string;
  // homePageUrl: string;
  // baseUrl: string;
  // emptyMessageText: string;
  // location: Location;
  constructor(
  ) {
    // App Settings
    this.app = {
      name: 'CPRS',
      description: 'PTG Time Tracking',
      year: ((new Date()).getFullYear())
    };
    this.loginUrl = '/auth/login';
    // this.emptyMessageText = 'No Record Found';
    // this.baseUrl = environment.baseUrlApi;
    // this.baseUrl=this.baseUrlV2;
  }
  // getAppSetting(name) {
  //   return name ? this.app[name] : this.app;
  // }

  // get DomainName(): string {
  //     return environment.baseUrlClient;
  // }
  
}
