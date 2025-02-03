import { TestBed } from '@angular/core/testing';

import { MicrophoneServiceService } from './microphone-service.service';

describe('MicrophoneServiceService', () => {
  let service: MicrophoneServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MicrophoneServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
