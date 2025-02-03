import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatmesssageDocumentrenderingComponent } from './chatmesssage-documentrendering.component';

describe('ChatmesssageDocumentrenderingComponent', () => {
  let component: ChatmesssageDocumentrenderingComponent;
  let fixture: ComponentFixture<ChatmesssageDocumentrenderingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatmesssageDocumentrenderingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatmesssageDocumentrenderingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
