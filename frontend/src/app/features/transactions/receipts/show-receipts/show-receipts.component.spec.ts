import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowReceiptsComponent } from './show-receipts.component';

describe('ShowReceiptsComponent', () => {
  let component: ShowReceiptsComponent;
  let fixture: ComponentFixture<ShowReceiptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowReceiptsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowReceiptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
