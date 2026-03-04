// ANGULAR
import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder
} from '@angular/forms';

// MATERIAL
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

// SERVICES
import { ItemValidatorsService } from '../../../../core/services/item/item-validators.service';

// SHARED
import { MaxDecimalsDirective } from '../../../../shared/directives/max-decimals.directive';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

// MODELS
import {
  ItemGroupResponse,
  ItemType,
  Uom,
  ItemDetailResponse
} from '../../../../core/models/item.models';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MaxDecimalsDirective
  ],
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemFormComponent implements OnInit {

  // MODE
  @Input() mode: 'create' | 'view' | 'edit' = 'create';

  // DATA
  @Input() initialData?: ItemDetailResponse;
  @Input({ required: true }) itemGroups: ItemGroupResponse[] = [];

  // STATE
  @Input() loading = false;

  // EVENTS
  @Output() create = new EventEmitter<Record<string, any>>();
  @Output() update = new EventEmitter<Record<string, any>>();
  @Output() goBack = new EventEmitter<void>();

  // DEPENDENCIES
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly validatorService = inject(ItemValidatorsService);
  private readonly dialog = inject(MatDialog);

  // STATIC DATA
  readonly itemTypes: ItemType[] = ['GOODS', 'SERVICE'];
  readonly uoms: Uom[] = ['NOS', 'BOX', 'KG', 'LITRE', 'METER', 'PCS'];
  readonly gstRates: number[] = [0, 5, 12, 18, 28];

  // FORM
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

    // PATCH DATA (VIEW / EDIT)
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }

    // VIEW MODE
    if (this.mode === 'view') {
      this.form.disable();
    }

    // EDIT MODE
    if (this.mode === 'edit') {

      this.form.controls.icode.disable();

      this.form.controls.icode.clearAsyncValidators();
      this.form.controls.icode.updateValueAndValidity();
    }

  }

  public onCreateClick(): void {

    if (this.form.invalid || this.loading) return;

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
  
  // EMIT
  submit(): void {

    if (this.form.invalid || this.loading) return;

    const raw = this.form.getRawValue();

    if (raw.igid === null) return;

    if (this.mode === 'create') {
      this.create.emit(raw);
    }

    if (this.mode === 'edit') {
      this.update.emit(raw);
    }

  }
  
  public onGoBack(): void {
    this.goBack.emit();
  }

  public onClear(): void {

    if (this.loading){
      return;
    }

    if (this.form.pristine) {
      this.form.markAsPristine();
      this.form.markAsUntouched();
      return;
    }

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

      if (!result) return;

      this.form.reset({
        isBom: false,
        stockable: true,
        gstType: 'GST'
      });

      this.form.markAsPristine();
      this.form.markAsUntouched();

    });

  }

  public onIcodeInput(event: Event): void {

    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();

    if (input.value !== upper) {
      input.value = upper;
    }

  }

  get isDirty(): boolean {
    return this.form.dirty;
  }
}