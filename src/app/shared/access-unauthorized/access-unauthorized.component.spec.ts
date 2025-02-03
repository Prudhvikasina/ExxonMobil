import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessUnauthorizedComponent } from './access-unauthorized.component';

describe('AccessUnauthorizedComponent', () => {
  let component: AccessUnauthorizedComponent;
  let fixture: ComponentFixture<AccessUnauthorizedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessUnauthorizedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessUnauthorizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
