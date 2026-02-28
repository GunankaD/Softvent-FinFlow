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

import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ItemService } from '../../../core/services/item/item.service';
import { ItemValidatorsService } from '../../../core/services/item/item-validators.service';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { ItemGroupResponse, ItemType, Uom } from '../../../core/models/item.models';

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule
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

  readonly loading = signal(false);
  readonly itemGroups = signal<ItemGroupResponse[]>([]);

  readonly itemTypes: ItemType[] = ['GOODS', 'SERVICE'];
  readonly uoms: Uom[] = ['NOS', 'BOX', 'KG', 'LITRE', 'METER', 'PCS'];

  readonly form = this.fb.group({
    icode: this.fb.control('', {
      validators: [Validators.required, Validators.maxLength(30)],
      asyncValidators: [this.validatorService.icodeAvailabilityValidator()],
      updateOn: 'blur'
    }),
    name: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    description: this.fb.control('', Validators.required),
    hsnSacCode: this.fb.control('', [Validators.required, Validators.maxLength(10)]),
    itemType: this.fb.control<ItemType>('GOODS', Validators.required),
    uom: this.fb.control<Uom>('NOS', Validators.required),
    isBom: this.fb.control(false),
    stockable: this.fb.control(true),
    purchaseRate: this.fb.control<number | undefined>(undefined),
    salesRate: this.fb.control<number | undefined>(undefined),
    gstRate: this.fb.control(0, Validators.required),
    gstType: this.fb.control('GST', Validators.required),
    igid: this.fb.control<number>(0, Validators.required)
  });

  ngOnInit(): void {
    this.itemService.getAllGroups().subscribe(groups => {
      this.itemGroups.set(groups.filter(g => g.isActive));
    });
  }

  submit(): void {

    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);

    this.itemService.create(this.form.getRawValue()).subscribe({
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
}