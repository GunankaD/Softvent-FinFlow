// ANGULAR
import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

// AG GRID
import { AgGridAngular } from 'ag-grid-angular';
import { IRowNode, ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';

// MATERIAL UI
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// DTOs & DEPENDENCIES
import { TableColumn } from '../models/table-column.model';

@Component({
  selector: 'app-grid-table',
  standalone: true,
  templateUrl: './grid-table.component.html',
  styleUrls: ['./grid-table.component.scss'],
  imports: [
    CommonModule,
    AgGridAngular,
    MatTableModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ]
})
export class GridTableComponent {

  // INPUTS
  @Input({ required: true }) columns!: TableColumn[];
  @Input({ required: true }) data!: any[];
  @Input({ required: true }) loading!: boolean;

  // OUTPUTS
  @Output() refresh = new EventEmitter<void>();
  @Output() view = new EventEmitter<any>();

  // ACTION ROW VARIABLES
  selectedColumn: string = '__all';
  searchValue: string = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;

  // GRID STATE
  private gridApi!: GridApi;

  columnDefs: ColDef[] = [];
  rowData: any[] = [];

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: false,
    suppressHeaderFilterButton: true,
    suppressHeaderMenuButton: true,
  };

  // LIFECYCLE: RUNS EVERY TIME @INPUTS CHANGE
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) this.rowData = this.data ?? [];
    if (changes['columns']) this.buildColumnDefs();
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
  }

  // COLUMN BUILDER
  private buildColumnDefs(): void {

    const rowNumberColumn: ColDef = {
      headerName: 'No.',
      valueGetter: params => {
        if (!this.gridApi) return '';
        if (!params.node) return '';
        const pageSize = this.gridApi.paginationGetPageSize();
        const currentPage = this.gridApi.paginationGetCurrentPage();
        return currentPage * pageSize + params.node.rowIndex! + 1;
      },
      // valueGetter: params => "0000",
      flex: 0.5,
      minWidth: 60,
      sortable: false,
      cellStyle: {
        textAlign: 'center'
      }
    };

    const dynamicColumns: ColDef[] = this.columns.map(col => {

      if (col.key === 'eyeIcon') {
        return {
          headerName: col.label,
          width: 90,
          minWidth: col.minWidth,
          flex: col.flex,
          sortable: false,
          field: 'eyeIcon',
          cellRenderer: () => `
            <div class="eye-cell">
              <span class="material-icons">visibility</span>
            </div>
          `,
          cellStyle: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            lineHeight: 1
          },
        };
      }

      if (col.key === 'createdAt') {
        return {
          headerName: col.label,
          field: col.key,
          minWidth: col.minWidth,
          flex: col.flex,
          filter: false,
          valueFormatter: params => {
            if (!params.value) return '';
            return new Date(params.value)
              .toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
          }
        };
      }

      // ALL OTHER COLUMNS
      return {
        headerName: col.label,
        field: col.key,
        flex: col.flex,
        minWidth: col.minWidth, 
        filter: 'agTextColumnFilter'
      };
    });

    this.columnDefs = [
      rowNumberColumn,
      ...dynamicColumns
    ];
  }

  // FILTERING
  applyFilter(): void {

    if (!this.gridApi) return;

    // DATE RANGE MODE
    if (this.selectedColumn === 'createdAt') {
      this.gridApi.onFilterChanged();
      this.gridApi.paginationGoToFirstPage();
      return;
    }

    // TEXT MODE
    const value = this.searchValue.trim();
    if (!value) {
      this.gridApi.setFilterModel(null);
      this.gridApi.setGridOption('quickFilterText', '');
      return;
    }

    // ALL COLUMNS
    if (this.selectedColumn === '__all') {
      this.gridApi.setFilterModel(null);
      this.gridApi.setGridOption('quickFilterText', value);
      return;
    }

    // SPECIFIC COLUMN
    this.gridApi.setGridOption('quickFilterText', '');
    this.gridApi.setFilterModel({
      [this.selectedColumn]: {
        filterType: 'text',
        type: 'contains',
        filter: value
      }
    });

  }
  
  // DATE FILTERING
  isExternalFilterPresent(): boolean {
    return this.selectedColumn === 'createdAt' && (!!this.fromDate || !!this.toDate);
  }
  doesExternalFilterPass(node: IRowNode<any>): boolean {
    const value = node.data.createdAt;
    if (!value) return true;

    // STEP 1: extract date along with time
    const cellDate = new Date(value);

    // STEP 2: strip time and keep year, month and date only
    const cell = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());

    // STEP 3: filter out current row if its before fromDate
    if (this.fromDate) {
      const from = new Date(this.fromDate.getFullYear(), this.fromDate.getMonth(), this.fromDate.getDate());
      if (cell < from) return false;
    }

    // STEP 4: filter out current row if its after toDate
    if (this.toDate) {
      const to = new Date(this.toDate.getFullYear(), this.toDate.getMonth(), this.toDate.getDate());
      if (cell > to) return false;
    }

    return true;
  }

  // VIEW ICON: EMIT VIEW EVENT TO ROUTE
  onCellClicked(event: any): void {
    if (event.colDef.field === 'eyeIcon') {
      this.view.emit(event.data);
    }
  }
  onRefresh(): void {
    this.selectedColumn = '__all';
    this.searchValue = '';
    this.fromDate = null;
    this.toDate = null;

    if (this.gridApi) {
      this.gridApi.setFilterModel(null);
      this.gridApi.setGridOption('quickFilterText', '');
      this.gridApi.paginationGoToFirstPage();
    }

    this.refresh.emit();
  }
  clearSearch(): void {
    this.searchValue = '';
    this.applyFilter();
  }
  clearDateRange(): void {
    this.fromDate = null;
    this.toDate = null;
    this.applyFilter();
  }
  onColumnChange(): void {
    this.searchValue = '';
    this.fromDate = null;
    this.toDate = null;

    this.applyFilter();
  }
}