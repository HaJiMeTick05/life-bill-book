import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddtransactionPage } from './addtransaction.page';

describe('AddtransactionPage', () => {
  let component: AddtransactionPage;
  let fixture: ComponentFixture<AddtransactionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddtransactionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
