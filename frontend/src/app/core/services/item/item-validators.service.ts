import { Injectable, inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

import { ItemService } from './item.service';

@Injectable({
  providedIn: 'root'
})
export class ItemValidatorsService {

  private readonly itemService = inject(ItemService);

  public icodeAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      if (!control.value || control.invalid) {
        return of(null);
      }

      return timer(400).pipe(
        switchMap(() =>
          this.itemService.checkIcodeAvailability(control.value)
        ),
        map(response =>
          response.available ? null : { icodeTaken: true }
        ),
        catchError(() => of(null))
      );
    };
  }
}