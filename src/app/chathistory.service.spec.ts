import { TestBed } from '@angular/core/testing';

import { ChathistoryService } from './chathistory.service';

describe('ChathistoryService', () => {
  let service: ChathistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChathistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
