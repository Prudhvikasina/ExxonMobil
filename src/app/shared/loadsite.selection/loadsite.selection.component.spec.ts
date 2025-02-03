import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadsiteSelectionComponent } from './loadsite.selection.component';

describe('LoadsiteSelectionComponent', () => {
  let component: LoadsiteSelectionComponent;
  let fixture: ComponentFixture<LoadsiteSelectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadsiteSelectionComponent]
    });
    fixture = TestBed.createComponent(LoadsiteSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
