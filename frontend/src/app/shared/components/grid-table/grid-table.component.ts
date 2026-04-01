// ANGULAR
import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

// AG GRID
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, CellStyle } from 'ag-grid-community';

// MATERIAL UI
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class GridTableComponent {

  // INPUTS
  @Input({ required: true }) columns!: TableColumn[];
  @Input({ required: true }) data!: any[];
  @Input({ required: true }) loading!: boolean;

  @Input() gridHeight: string = '600px';
  @Input() showRefresh: boolean = true;
  @Input() paginationPageSize: number = 25;
  @Input() pagination: boolean = true;
  @Input() paginationPageSizeSelector: number[] = [10, 25, 50, 100];
  @Input() enableFilter: boolean = true;

  // OUTPUTS
  @Output() refresh = new EventEmitter<void>();
  @Output() view = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() inputValueChange = new EventEmitter<any>();

  // GRID STATE
  private gridApi!: GridApi;

  columnDefs: ColDef[] = [];
  rowData: any[] = [];

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: this.enableFilter,
    floatingFilter: this.enableFilter,
    suppressHeaderFilterButton: true,
    suppressHeaderMenuButton: true,
  };

  // LIFECYCLE: RUNS EVERY TIME @INPUTS CHANGE
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) this.rowData = this.data ?? [];
    if (changes['columns']) this.buildColumnDefs();
    if (changes['enableFilter']) {
      this.defaultColDef = {
        ...this.defaultColDef,
        filter: this.enableFilter,
        floatingFilter: this.enableFilter
      };
    }
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
  }

  // COLUMN BUILDER
  private buildColumnDefs(): void {

    // INDEX COLUMN
    const rowNumberColumn: ColDef = {
      headerName: 'No.',
      headerTooltip: 'Index',
      valueGetter: params => {
        if (!this.gridApi || !params.node) return '';
        const pageSize = this.gridApi.paginationGetPageSize();
        const currentPage = this.gridApi.paginationGetCurrentPage();
        return currentPage * pageSize + params.node.rowIndex! + 1;
      },
      // valueGetter: params => "0000", // fits 4 digits atm
      flex: 0.5,
      minWidth: 64,
      sortable: false,
      filter: false,
      cellStyle: { textAlign: 'center'}
    };

    const dynamicColumns: ColDef[] = this.columns.map(col => {

      // VIEW ICON COLUMNS
      if (col.type === 'viewIcon') {
        return {
          headerName: col.label,
          headerTooltip: col.label,
          field: col.key,
          width: 90,
          minWidth: col.minWidth,
          flex: col.flex,
          sortable: false,
          filter: false,
          cellRenderer: () => `
            <div class="icon-cell">
              <span class="material-icons">visibility</span>
            </div>
          `,
          cellStyle: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            lineHeight: 1
          } as CellStyle,
        };
      }

      // DELETE ICON COLUMNS
      if (col.type === 'deleteIcon') {
        return {
          headerName: col.label,
          headerTooltip: col.label,
          field: col.key,
          width: 80,
          minWidth: col.minWidth,
          flex: col.flex,
          sortable: false,
          filter: false,
          cellRenderer: () => `
            <div class="icon-cell">
              <span class="material-icons" style="color: red; cursor: pointer;">delete</span>
            </div>
          `,
          cellStyle: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            lineHeight: 1
          } as CellStyle
        };
      }

      // DATE COLUMNS
      if (col.type === 'date') {
        return {
          headerName: col.label,
          headerTooltip: col.label,
          field: col.key,
          flex: col.flex,
          minWidth: col.minWidth,
          filter: 'agDateColumnFilter',
          valueFormatter: params => {
            if (!params.value) return '';
            return new Date(params.value).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        };
      }

      // NUMBER COLUMNS
      if (col.type === 'number') {
        return {
          headerName: col.label,
          headerTooltip: col.label,
          field: col.key,
          flex: col.flex,
          minWidth: col.minWidth,
          filter: 'agNumberColumnFilter'
        };
      }

      // CURRENCY COLUMNS
      if (col.type === 'currency') {
        return {
          headerName: col.label,
          headerTooltip: col.label,
          field: col.key,
          flex: col.flex,
          minWidth: col.minWidth,
          filter: 'agNumberColumnFilter',

          valueFormatter: params => {
            if (params.value == null) return '';
            return params.value.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 2
            });
          },

          cellStyle: {
            textAlign: 'right'
          } as CellStyle
        };
      }

      // CHECKBOX COLUMNS
      if (col.type === 'boolean') {
        return {
          headerName: col.label,
          headerTooltip: col.label,
          field: col.key,
          flex: col.flex,
          minWidth: col.minWidth,
          filter: 'agTextColumnFilter',
          // editable: true,
          cellStyle: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          } as CellStyle
        };
      }

      // INPUT COLUMNS
      if (col.type === 'input') {
        return {
          headerName: col.label,
          field: col.key,
          flex: col.flex,
          minWidth: col.minWidth,
          editable: true,
          filter: false,
          cellEditor: 'agTextCellEditor',

          valueParser: params => {
            const val = parseFloat(params.newValue);
            return isNaN(val) ? 0 : val;
          },

          cellStyle: {
            textAlign: 'right'
          } as CellStyle
        };
      }

      // TEXT COLUMNS (DEFAULT)
      return {
        headerName: col.label,
        headerTooltip: col.label,
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

  // VIEW ICON: EMIT VIEW EVENT TO ROUTE
  onCellClicked(event: any): void {
    if (event.colDef.field === 'viewIcon') {
      this.view.emit(event.data);
    }
    if (event.colDef.field === 'deleteIcon') {
      this.delete.emit(event.data);
    }
  }

  onCellValueChanged(params: any): void {
    this.inputValueChange.emit({ ...params.data });
  }

  onRefresh(): void {
    if (this.gridApi) {
      this.gridApi.setFilterModel(null);
      this.gridApi.paginationGoToFirstPage();
    }

    this.refresh.emit();
  }
}