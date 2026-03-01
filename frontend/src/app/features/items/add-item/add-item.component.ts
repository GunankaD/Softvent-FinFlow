// ANGULAR
import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  NonNullableFormBuilder
} from '@angular/forms';
import { Router } from '@angular/router';

// MATERIAL UI
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

// SERVICES AND DEPENDENCIES
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ItemService } from '../../../core/services/item/item.service';
import { ItemValidatorsService } from '../../../core/services/item/item-validators.service';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { MaxDecimalsDirective } from '../../../shared/directives/max-decimals.directive';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

// DTOs
import { ItemGroupResponse, ItemType, Uom } from '../../../core/models/item.models';

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MaxDecimalsDirective
  ],
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddItemComponent implements OnInit {

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly itemService = inject(ItemService);
  private readonly validatorService = inject(ItemValidatorsService);
  private readonly snackbar = inject(SnackbarService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(false);
  readonly itemGroups = signal<ItemGroupResponse[]>([]);

  readonly itemTypes: ItemType[] = ['GOODS', 'SERVICE'];
  readonly uoms: Uom[] = ['NOS', 'BOX', 'KG', 'LITRE', 'METER', 'PCS'];
  readonly gstRates: number[] = [0, 5, 12, 18, 28];

readonly form = this.fb.group({
  icode: this.fb.control('', {
    validators: [
      Validators.required,
      Validators.maxLength(30),
      Validators.pattern(/^[A-Z]{3}[0-9]{4}$/)
    ],
    asyncValidators: [
      this.validatorService.icodeAvailabilityValidator()
    ],
    updateOn: 'change'
  }),

  name: this.fb.control('', [
    Validators.required,
    Validators.maxLength(100)
  ]),

  description: this.fb.control('', [
    Validators.required,
    Validators.minLength(5),
    Validators.maxLength(1000)
  ]),

  hsnSacCode: this.fb.control('', [
    Validators.required,
    Validators.maxLength(10),
    Validators.pattern(/^[0-9]+$/)
  ]),

  itemType: this.fb.control<ItemType>('GOODS', Validators.required),

  uom: this.fb.control<Uom>('NOS', Validators.required),

  isBom: this.fb.control(false),

  stockable: this.fb.control(true),

  purchaseRate: this.fb.control<number | undefined>(undefined, [
    Validators.min(0)
  ]),

  salesRate: this.fb.control<number | undefined>(undefined, [
    Validators.min(0)
  ]),

  gstRate: this.fb.control<number>(0, Validators.required),

  gstType: this.fb.control('GST', Validators.required),

  igid: this.fb.control<number | null>(null, Validators.required)
});

  ngOnInit(): void {
    this.itemService.getAllGroups().subscribe(groups => {
      console.log(groups);
      this.itemGroups.set(groups.filter(g => g.isActive));
    });
  }

  submit(): void {

    if (this.form.invalid || this.loading()) return;
    const raw = this.form.getRawValue();

    if (raw.igid === null) return;

    const request = {
      ...raw,
      igid: raw.igid
    };

    this.loading.set(true);

    this.itemService.create(request).subscribe({
      next: () => {
        this.snackbar.success('Item created successfully', 3000);
        this.router.navigate(['/items/show-items']);
      },
      error: (err) => {
        this.snackbar.error(
          err?.error?.message ?? 'Failed to create item',
          4000
        );
        this.loading.set(false);
      }
    });
  }

  public onIcodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();

    if (input.value !== upper) {
      input.value = upper;
    }
  }

  public onGoBack(): void {

    if (this.loading()) return;

    if (!this.form.dirty) {
      this.router.navigate(['/items/show-items']);
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to leave?',
        confirmColor: 'red',
        confirmButtonText: 'Leave'
      },
      panelClass: 'custom-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.router.navigate(['/items/show-items']);
    });
  }

  public onClear(): void {

    if (this.loading() || this.form.pristine) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Clear Form',
        message: 'Are you sure you want to clear all entered item details?',
        confirmColor: 'red',
        confirmButtonText: 'Clear'
      },
      panelClass: 'custom-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!result) { return; }

      this.form.reset({
        isBom: false,
        stockable: true,
        gstType: 'GST'
      });

      this.form.markAsPristine();
      this.form.markAsUntouched();
    });
  }

  public onCreateClick(): void {

    if (this.form.invalid || this.loading()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Create Item',
        message: `Are you sure you want to create item "${this.form.value.name}"?`,
        confirmColor: 'green',
        confirmButtonText: 'Create'
      },
      panelClass: 'custom-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.submit();
    });
  }
}