import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationOverlayComponent } from './notification-overlay.component';

describe('NotificationOverlayComponent', () => {
  let component: NotificationOverlayComponent;
  let fixture: ComponentFixture<NotificationOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationOverlayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
