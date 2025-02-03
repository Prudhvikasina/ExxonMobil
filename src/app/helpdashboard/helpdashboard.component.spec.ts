import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdashboardComponent } from './helpdashboard.component';

describe('HelpdashboardComponent', () => {
  let component: HelpdashboardComponent;
  let fixture: ComponentFixture<HelpdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpdashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
