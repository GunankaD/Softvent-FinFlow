// ANGULAR
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// MATERIAL UI
import { MatSnackBarModule } from '@angular/material/snack-bar';

// DEPENDENCIES AND SERVICES
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { ItemService } from '../../../core/services/item/item.service';
import { GridTableComponent } from '../../../shared/components/grid-table/grid-table.component';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';

// DTOs
import { ItemSummaryResponse } from '../../../core/models/item.models';
import { TableColumn } from '../../../shared/components/models/table-column.model';
import { Breadcrumb } from '../../../shared/components/models/breadcrumb.model';

@Component({
  selector: 'app-show-items',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    GridTableComponent,
    BreadcrumbComponent
  ],
  templateUrl: './show-items.component.html',
  styleUrls: ['./show-items.component.scss']
})
export class ShowItemsComponent implements OnInit {

  private readonly itemService = inject(ItemService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly items = signal<ItemSummaryResponse[]>([]);

  public breadcrumbs(): Breadcrumb[] {
    return [
      { label: 'Items', route: '/items' },
      { label: 'All' }
    ];
  }

  readonly columns: TableColumn[] = [
    { key: 'icode',        label: 'Item Code',        flex: 1,    minWidth: 100,   type: 'text' },
    { key: 'name',         label: 'Item Name',        flex: 2,    minWidth: 160,   type: 'text' },
    { key: 'itemType',     label: 'Type',             flex: 0.5,  minWidth: 90 ,   type: 'text' },
    { key: 'uom',          label: 'UOM',              flex: 0.5,  minWidth: 90 ,   type: 'text' },
    { key: 'purchaseRate', label: 'Purchase Rate ₹',  flex: 1,    minWidth: 140,   type: 'number' },
    { key: 'salesRate',    label: 'Sales Rate ₹',     flex: 1,    minWidth: 120,   type: 'number' },
    { key: 'gstRate',      label: 'GST%',             flex: 0.5,  minWidth: 70 ,   type: 'number' },
    { key: 'createdAt',    label: 'Created On',       flex: 2,    minWidth: 170,   type: 'date' },
    { key: 'isActive',     label: 'Active',           flex: 0.25, minWidth: 60 ,   type: 'boolean' },
    { key: 'viewIcon',     label: 'View',             flex: 0.5,  minWidth: 70 ,   type: 'icon' }
  ];

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);

    this.itemService.getAll().subscribe({
      next: (data) => {
        this.items.set([...data]);
        this.loading.set(false);
      },
      error: (err) => {
        this.snackbarService.error(
          err?.error?.message ?? 'Failed to load items',
          4000
        );
        this.loading.set(false);
      }
    });
  }

  onRowClick(item: ItemSummaryResponse): void {
    this.router.navigate(['/items', item.icode]);
  }
}