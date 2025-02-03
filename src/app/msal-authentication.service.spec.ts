import { TestBed } from '@angular/core/testing';

import { MsalAuthenticationService } from './msal-authentication.service';

describe('MsalAuthenticationService', () => {
  let service: MsalAuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MsalAuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
