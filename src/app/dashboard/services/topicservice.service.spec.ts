import { TestBed } from '@angular/core/testing';

import { TopicserviceService } from './topicservice.service';

describe('TopicserviceService', () => {
  let service: TopicserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TopicserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
