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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

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
    MatDatepickerModule,
    MatNativeDateModule,
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

  // VIEW CHILD (creating references to the objects in html)
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table
  readonly dataSource = new MatTableDataSource<any>();

  // Action row variables
  selectedColumn: string = '__all';
  searchValue: string = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;


  /*
   * Runs after the view (HTML + @ViewChild refs like paginator, sort) is initialized.
   */
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // sorting functionality for 'Created On'
    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'createdAt') {
        return new Date(item.createdAt).getTime();
      }
      return item[property];
    };

    // filtering functionality for 'All Columns' & 'Created On'
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const parsed = JSON.parse(filter);

      // TEXT FILTERING
      if (parsed.type === 'text') {
        const value = parsed.value.toLowerCase();
        if (!value) return true;

        if (parsed.column === '__all') {
          return this.columns
            .filter(col => col.key !== 'createdAt') // exclude date column
            .some(col =>
              String(data[col.key] ?? '')
                .toLowerCase()
                .includes(value)
            );
        }

        return String(data[parsed.column] ?? '')
          .toLowerCase()
          .includes(value);
      }

      // DATE RANGE FILTERING
      if (parsed.type === 'date') {
        const rowTime = new Date(data.createdAt).getTime();
        const from = parsed.from ? new Date(parsed.from).getTime() : null;
        const to = parsed.to ? new Date(parsed.to).getTime() : null;

        return (
          (!from || rowTime >= from) &&
          (!to || rowTime <= to)
        );
      }

      return true;
    };

  }

  applyFilter(): void {
    // DATE RANGE MODE
    if (this.selectedColumn === 'createdAt') {

      const filterObject = {
        type: 'date',
        from: this.fromDate,
        to: this.toDate
      };

      this.dataSource.filter = JSON.stringify(filterObject);
    }

    // TEXT MODE
    else {

      const filterObject = {
        type: 'text',
        column: this.selectedColumn,
        value: this.searchValue.trim()
      };

      this.dataSource.filter = JSON.stringify(filterObject);
    }

    // Force recalculation safely
    if (this.dataSource.paginator) {
      this.dataSource._updateChangeSubscription(); // important
      this.paginator.firstPage();
    }
  }

  /*
   * For the X button inside Search input
   */
  clearSearch(): void {
    this.searchValue = '';
    this.applyFilter();
  }

  clearDateRange(): void {
    this.fromDate = null;
    this.toDate = null;
    this.applyFilter();
  }

  /*
   * When we select the filter column
   */
  onColumnChange(): void {
    this.searchValue = '';
    this.fromDate = null;
    this.toDate = null;

    this.applyFilter();
  }

  /*
   * Runs if there are @Input() values (first time + every change).
   */ 
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
