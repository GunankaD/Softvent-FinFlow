// ANGULAR
import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// MATERIAL
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// SERVICES
import { ItemService } from '../../../core/services/item/item.service';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';

// SHARED
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ItemFormComponent } from '../shared/item-form/item-form.component';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';

// MODELS
import {
  ItemDetailResponse,
  ItemGroupResponse,
  ItemUpdateRequest
} from '../../../core/models/item.models';
import { Breadcrumb } from '../../../shared/components/models/breadcrumb.model';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    ItemFormComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemDetailsComponent implements OnInit {
  @ViewChild(ItemFormComponent)
  private itemForm?: ItemFormComponent;

  // INJECTIONS
  private readonly itemService = inject(ItemService);
  private readonly snackbar = inject(SnackbarService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  // STATE
  readonly loading = signal(true);
  readonly updating = signal(false);
  readonly deleting = signal(false);

  // DATA
  readonly item = signal<ItemDetailResponse | null>(null);
  readonly itemGroups = signal<ItemGroupResponse[]>([]);
  private icode = '';

  public breadcrumbs(): Breadcrumb[] {
    return [
      { label: 'Items', route: '/items' },
      { label: 'All', route: '/items/show-items' },
      { label: this.item()?.name ?? '' }
    ];
  }

  ngOnInit(): void {

    this.icode = this.route.snapshot.paramMap.get('icode') ?? '';

    if (!this.icode) {
      this.router.navigate(['/items/show-items']);
      return;
    }

    // FETCH ITEM
    this.itemService.getByCode(this.icode).subscribe({
      next: (response: ItemDetailResponse) => {
        this.item.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.snackbar.error('Failed to load item', 4000);
        this.router.navigate(['/items/show-items']);
      }
    });

    // FETCH GROUPS
    this.itemService.getAllGroups().subscribe(groups => {
      this.itemGroups.set(groups.filter(g => g.isActive));
    });

  }

  public onUpdate(data: any): void {

    if (this.loading() || this.updating() || this.deleting()) return;

    const { icode, ...rest } = data;
    const request: ItemUpdateRequest = rest;

    this.updating.set(true);

    this.itemService.updateByCode(this.icode, request).subscribe({
      next: (response: ItemDetailResponse) => {
        this.snackbar.success('Item updated successfully', 3000);
        this.item.set(response);
        this.updating.set(false);
        this.itemForm?.form.markAsPristine();
        this.itemForm?.cancelEdit();
      },
      error: (err) => {
        this.snackbar.error(
          err?.error?.message ?? 'Failed to update item',
          4000
        );
        this.updating.set(false);
      }
    });

  }

  public onDelete(): void {

    if (this.deleting()) return;

    this.deleting.set(true);

    this.itemService.deleteByCode(this.icode).subscribe({
      next: () => {

        this.snackbar.success('Item deleted successfully', 3000);
        this.router.navigate(['/items/show-items']);

      },
      error: (err) => {
        this.snackbar.error(
          err?.error?.message ?? 'Failed to delete item',
          4000
        );
        this.deleting.set(false);
      }
    });

  }

  public onGoBack(form: ItemFormComponent): void {

    if (this.loading() || this.updating() || this.deleting()) return;

    if (!form.isDirty) {
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
}