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
  ItemDetailResponse
} from '../../../../core/models/item.models';
import { ItemType } from '../../../../core/enums/item-type.enum';
import { Uom } from '../../../../core/enums/uom.enum';

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
  @Input() mode: 'create' | 'view' = 'create';

  // DATA
  @Input() initialData?: ItemDetailResponse;
  @Input({ required: true }) itemGroups: ItemGroupResponse[] = [];

  // STATE
  @Input() loading = false;
  @Input() creating = false;
  @Input() updating = false;
  @Input() deleting = false;
  public isEditMode = false;

  // EVENTS
  @Output() create = new EventEmitter<Record<string, any>>();
  @Output() update = new EventEmitter<Record<string, any>>();
  @Output() delete = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();

  // DEPENDENCIES
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly validatorService = inject(ItemValidatorsService);
  private readonly dialog = inject(MatDialog);

  // STATIC DATA
  readonly itemTypes: ItemType[] = Object.values(ItemType);
  readonly uoms: Uom[] = Object.values(Uom);
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

    itemType: this.fb.control<ItemType>(ItemType.GOODS, Validators.required),

    uom: this.fb.control<Uom>(Uom.NOS, Validators.required),

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

    // PATCH DATA (VIEW)
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }

    // VIEW MODE
    if (this.mode === 'view') {
      this.form.disable();
    }
  }

  public onGoBack(): void {
    this.goBack.emit();
  }

  // EMIT
  submit(): void {

    if (
      this.form.invalid || 
      this.loading || 
      this.creating || 
      this.updating ||
      this.deleting 
    ) return;

    const raw = this.form.getRawValue();

    if (raw.igid === null) return;

    if (this.mode === 'create') {
      this.create.emit(raw);
    }

    if (this.mode === 'view') {
      this.update.emit(raw);
    }

  }

  // CREATE MODE
  public onClearClick(): void {

    if (this.creating) return;

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

  public onCreateClick(): void {

    if (this.form.invalid || this.creating) return;

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

  // VIEW/EDIT MODE
  public onUpdateClick(): void {

    if (this.form.invalid || this.loading || this.updating || this.deleting) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Update Item',
        message: `Are you sure you want to update item "${this.form.getRawValue().name}"?`,
        confirmColor: 'green',
        confirmButtonText: 'Update'
      },
      panelClass: 'custom-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.submit();
    });
  }

  public onDeleteClick(): void {

    if (this.loading || this.deleting || this.updating) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Item',
        message: `Are you sure you want to delete item "${this.form.getRawValue().name}"?`,
        confirmColor: 'red',
        confirmButtonText: 'Delete'
      },
      panelClass: 'custom-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.delete.emit();
    });

  }

  public enableEdit(): void {
    if (this.loading || this.updating || this.deleting) return;

    this.isEditMode = true;

    this.form.enable();
    this.form.controls.icode.disable();
  }

  public cancelEdit(): void {
    if (this.loading || this.deleting) return;
    
    if (!this.form.dirty) {
      this.exitEditMode();
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Discard Changes?',
        message: `You have unsaved changes. Are you sure you want to revert?`,
        confirmColor: 'red',
        confirmButtonText: 'Discard'
      },
      panelClass: 'custom-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      if (this.initialData) {
        this.form.patchValue(this.initialData);
      }
      this.exitEditMode();
    });
  }
  
  private exitEditMode(): void {
    this.isEditMode = false;
    this.form.disable();
    this.form.markAsPristine();
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

  // MODE HELPERS
  get isCreateMode(): boolean {
    return this.mode === 'create';
  }

  get isViewMode(): boolean {
    return this.mode === 'view';
  }
}