import { Injectable } from '@angular/core';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, PopupRequest, RedirectRequest, EventMessage, EventType } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me'; // Prod graph endpoint. Uncomment to use.
import { HttpClient } from '@angular/common/http';

type ProfileType = {
  givenName?: string,
  surname?: string,
  userPrincipalName?: string,
  id?: string
};
@Injectable({
  providedIn: 'root'
})
export class MsalAuthenticationService {
  isIframe = false;
  authenticated = false;
  private readonly _destroying$ = new Subject<void>();
  profile!: ProfileType;
  sharedPage: boolean = false;
  shareView: boolean = false;
  activeGroupId: any;
  activeViewId: any;
  activeGroupName: any;
  navBar: boolean = false;
  unAuthorized: boolean = false;
  authenticate: boolean = false;

  constructor(private http: HttpClient,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {

   }


    


  setLoginDisplay() {
    this.authenticated = this.authService.instance.getAllAccounts().length > 0;
  }
  checkAuthentication() {
    return this.authService.instance.getAllAccounts().length > 0;
  }

  get AliasName(): string {
    if (this.authService.instance.getActiveAccount() !== null) {
      const activeAccount = this.authService.instance.getActiveAccount();
      
      if (activeAccount !== null) {
        const email = activeAccount.username;
        const parts = email.split('@');
        if (parts.length > 0) {
          return parts[0]; 
        }
      }
    }
    return '';
  }
  
getAliases() {
  const activeAccount = this.authService.instance.getActiveAccount();
  if (activeAccount) {
    const username = activeAccount.username;
    const atIndex = username.indexOf('@');
    if (atIndex !== -1) {
      return username.substring(0, atIndex);
    } else {
      return username;
    }
  } else {
    return '';
  }
}




  checkAndSetActiveAccount() {
    let activeAccount = this.authService.instance.getActiveAccount();

    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }
  async loginRedirect() {
    
    if (this.msalGuardConfig.authRequest) {
      await this.authService.handleRedirectObservable();
      this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
    } else {
      this.authService.loginRedirect();
    }
  }

  loginAuthentication() {

    if (this.msalGuardConfig.authRequest) {
      this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
    } else {
      this.authService.loginRedirect();
    }
  }

  loginPopup() {

    if (this.msalGuardConfig.authRequest) {
      this.authService.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
        .subscribe((response: AuthenticationResult) => {
          this.authService.instance.setActiveAccount(response.account);
        });
    } else {
      this.authService.loginPopup()
        .subscribe((response: AuthenticationResult) => {
          this.authService.instance.setActiveAccount(response.account);
        });
    }
  }

  logout(popup?: boolean) {
    if (popup) {
      this.authService.logoutPopup({
        mainWindowRedirectUri: "/"
      });
    } else {
      this.authService.logoutRedirect();
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}

export class SearchUserAlias {
  alias?: string;
  mciD365?: boolean;
  mciM365?: boolean;
  mciadmin?: boolean;
  mciazure?: boolean;
  mcisecurity?: boolean;
  mcisuperadmin?: boolean;
  mcita?: boolean;
  userStatus?: boolean;
  // alias?:string;
  // userStatus?:boolean;
  // mcapfpnta?:boolean;
  // mcapfpeg?:boolean;
  // mcapfceg?:boolean;
  // mcapfnaeg?:boolean;
  // mcapfteAdm?:boolean;
  // mcapfteAzure?:boolean;
  // mcapfteD365?:boolean;
  // mcapfteM365?:boolean;
  // mcapfteSec?:boolean;
  // mcapftepe?:boolean;
  // msspfteadm?:boolean;
  // operatorFTEAmin: boolean;
}
