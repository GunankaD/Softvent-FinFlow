// ANGULAR
import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// MATERIAL
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// SERVICES
import { ItemService } from '../../../core/services/item/item.service';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';

// SHARED
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ItemFormComponent } from '../shared/item-form/item-form.component';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';

// MODELS
import {
  ItemGroupResponse,
  ItemCreateRequest,
  ItemDetailResponse
} from '../../../core/models/item.models';
import { Breadcrumb } from '../../../shared/components/models/breadcrumb.model';

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    ItemFormComponent,
    BreadcrumbComponent
  ],
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddItemComponent implements OnInit {

  // INJECTIONS ouch
  private readonly itemService = inject(ItemService);
  private readonly snackbar = inject(SnackbarService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // GOES TO CHILD COMPONENT
  readonly creating = signal(false);
  readonly itemGroups = signal<ItemGroupResponse[]>([]);

  public breadcrumbs(): Breadcrumb[] {
    return [
      { label: 'Items', route: '/items' },
      { label: 'Add Item' }
    ];
  }

  ngOnInit(): void {

    // Fetch item groups
    this.itemService.getAllGroups().subscribe(groups => {
      this.itemGroups.set(groups.filter(g => g.isActive));
    });

  }

  public onCreate(data: any): void {

    if (this.creating()) return;

    const request: ItemCreateRequest = data;

    this.creating.set(true);

    this.itemService.create(request).subscribe({
      next: (response : ItemDetailResponse) => {
        this.snackbar.success('Item created successfully', 3000);
        this.router.navigate(['/items', response.icode]);
      },
      error: (err) => {
        this.snackbar.error(
          err?.error?.message ?? 'Failed to create item',
          4000
        );
        this.creating.set(false);
      }
    });
  }

  public onGoBack(form: ItemFormComponent): void {

    if (this.creating()) return;

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