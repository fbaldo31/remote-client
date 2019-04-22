import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageConnectionComponent } from './manage-connection.component';

describe('ManageConnectionComponent', () => {
  let component: ManageConnectionComponent;
  let fixture: ComponentFixture<ManageConnectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageConnectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
