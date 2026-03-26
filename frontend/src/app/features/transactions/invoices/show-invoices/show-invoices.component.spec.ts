import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowInvoicesComponent } from './show-invoices.component';

describe('ShowInvoicesComponent', () => {
  let component: ShowInvoicesComponent;
  let fixture: ComponentFixture<ShowInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowInvoicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
