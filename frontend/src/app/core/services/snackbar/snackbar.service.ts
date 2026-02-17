import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) {}

  error(message: string, duration = 3000) {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  success(message: string, duration = 3000) {
    this.snackBar.open(message, 'OK', {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
