import { Injectable, inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';

import { Observable, of, timer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

import { CustomerService } from './customer.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerValidatorsService {

  private readonly customerService = inject(CustomerService);

  /**
   * Async validator for customer code availability
   */
  public ccodeAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      if (!control.value || control.invalid) {
        return of(null);
      }

      return timer(400).pipe(
        switchMap(() =>
          this.customerService.checkCcodeAvailability(control.value)
        ),
        map(response =>
          response.available ? null : { ccodeTaken: true }
        ),
        catchError(() => of(null))
      );
    };
  }

  /**
   * Async validator for email availability
   */
  public emailAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      if (!control.value || control.invalid) {
        return of(null);
      }

      return timer(400).pipe(
        switchMap(() =>
          this.customerService.checkEmailAvailability(control.value)
        ),
        map(response =>
          response.available ? null : { emailTaken: true }
        ),
        catchError(() => of(null))
      );
    };
  }
}
