import { TestBed } from '@angular/core/testing';

import { SideMenuServiceService } from './side-menu-service.service';

describe('SideMenuServiceService', () => {
  let service: SideMenuServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SideMenuServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
