// ANGULAR
import { Component, Input, Output,EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ViewChild } from '@angular/core';

// MATERIAL UI
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements AfterViewInit{

  // INPUTS
  @Input({ required: true }) columns!: { key: string; label: string }[];
  @Input({ required: true }) data!: any[];
  @Input({ required: true }) loading!: boolean;

  // OUTPUTS
  @Output() refresh = new EventEmitter<void>();

  // VIEW CHILD
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // table
  readonly dataSource = new MatTableDataSource<any>();
  selectedColumn: string = '__all';
  searchValue: string = '';

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // sorting functionality for dates
    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'createdAt') {
        return new Date(item.createdAt).getTime();
      }
      return item[property];
    };

    // filtering functionality
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const parsed = JSON.parse(filter);
      const value = parsed.value.toLowerCase();

      if (!value) return true;

      if (parsed.column === '__all') {
        return this.columns.some(col =>
          String(data[col.key] ?? '')
            .toLowerCase()
            .includes(value)
        );
      }

      return String(data[parsed.column] ?? '')
        .toLowerCase()
        .includes(value);
    };
  }

  applyFilter(): void {
    const filterObject = {
      column: this.selectedColumn,
      value: this.searchValue.trim()
    };

    this.dataSource.filter = JSON.stringify(filterObject);
    this.paginator?.firstPage();

    setTimeout(() => {
      this.paginator?.firstPage();
    });
  }

  clearSearch(): void {
    this.searchValue = '';
    this.applyFilter();
  }

  ngOnChanges(): void {
    this.dataSource.data = this.data ?? [];
    // Rebind paginator + sort after data change
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  onRefresh(): void {
    // Reset search state
    this.selectedColumn = '__all';
    this.searchValue = '';

    // Clear filter
    this.dataSource.filter = '';

    // Reset paginator
    this.paginator?.firstPage();

    // Emit to parent to re-fetch
    this.refresh.emit();
  }

  get columnKeys(): string[] {
    return ['__rowNumber', ...this.columns.map(c => c.key)];
  }

  getRowNumber(index: number): number {
    if (!this.paginator) return index + 1;

    return (
      this.paginator.pageIndex * this.paginator.pageSize +
      index +
      1
    );
  }
}
