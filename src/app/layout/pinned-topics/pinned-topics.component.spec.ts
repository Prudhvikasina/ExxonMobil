import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinnedTopicsComponent } from './pinned-topics.component';

describe('PinnedTopicsComponent', () => {
  let component: PinnedTopicsComponent;
  let fixture: ComponentFixture<PinnedTopicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PinnedTopicsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PinnedTopicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
