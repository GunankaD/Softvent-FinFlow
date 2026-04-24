import { TestBed } from '@angular/core/testing';

import { PaymentApplicationService } from './payment-application.service';

describe('PaymentApplicationService', () => {
  let service: PaymentApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
