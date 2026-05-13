// ANGULAR
import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

// AG GRID
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, CellStyle, GetRowIdFunc, GetRowIdParams } from 'ag-grid-community';

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
    MatTooltipModule,
  ]
})
export class GridTableComponent {

  // INPUTS
  @Input({ required: true }) columns!: TableColumn[];
  @Input({ required: true }) data!: any[];
  @Input({ required: true }) loading!: boolean;
  
  @Input() gridHeight: string = '600px';

  @Input() showRefresh: boolean = true;
  @Input() enableFilter: boolean = true;
  @Input() pagination: boolean = true;
  @Input() enableRowSelection: boolean = false;

  @Input() paginationPageSize: number = 25;
  @Input() paginationPageSizeSelector: number[] = [10, 25, 50, 100];

  // OUTPUTS
  @Output() refresh = new EventEmitter<void>();
  @Output() view = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() inputValueChange = new EventEmitter<any>();
  @Output() select = new EventEmitter<any>();

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
        if (params.node?.rowIndex === undefined || params.node?.rowIndex === null) {
          return '';
        }

        const api = params.api;
        const pageSize = api.paginationGetPageSize();
        const currentPage = api.paginationGetCurrentPage();
        
        return (currentPage * pageSize) + params.node.rowIndex + 1;
      },
      // valueGetter: params => "0000", // fits 4 digits atm
      flex: 0.5,
      minWidth: 64,
      sortable: false,
      filter: false,
      cellStyle: { textAlign: 'center'}
    };

    const dynamicColumns: ColDef[] = this.columns.map(col => {
      const baseCol: ColDef = {
        headerName: col.label,
        headerTooltip: col.label,
        field: col.key,
        flex: col.flex,
        minWidth: col.minWidth,
      };

      // VIEW ICON COLUMNS
      if (col.type === 'viewIcon') {
        return {
          ...baseCol,
          width: 90,
          sortable: false,
          filter: false,
          editable: false,
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
          ...baseCol,
          width: 80,
          sortable: false,
          filter: false,
          editable: false,
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
          ...baseCol,
          filter: 'agDateColumnFilter',
          editable: false,
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
          ...baseCol,
          editable: false,
          filter: 'agNumberColumnFilter'
        };
      }

      // CURRENCY COLUMNS
      if (col.type === 'currency') {
        return {
          ...baseCol,
          filter: 'agNumberColumnFilter',
          editable: false,

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
          ...baseCol,
          filter: 'agTextColumnFilter',
          // editable: true,
          cellStyle: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          } as CellStyle
        };
      }

      // 1. AMOUNT (For Currency, Balances, Totals)
      if (col.type === 'inputAmount') {
        return {
          ...baseCol,
          editable: true,
          singleClickEdit: true,
          cellEditor: 'agNumberCellEditor',
          cellEditorParams: {
            precision: 2,
            step: 0.01,
            showStepperButtons: true,
            min: 0,
            max: Infinity
          },
          valueParser: (params: any) => {
            const input = params.newValue;
            if (input === null || input === undefined || input === '') return 0;

            const newValue = parseFloat(input);
            if (isNaN(newValue)) return 0;

            return newValue < 0 ? 0 : newValue;
          },
          cellStyle: { overflow: 'visible' } as CellStyle
        };
      }

      // 2. QUANTITY (For Whole Items)
      if (col.type === 'inputQuantity') {
        return {
          ...baseCol,
          editable: true,
          singleClickEdit: true,
          cellEditor: 'agNumberCellEditor',
          cellEditorParams: {
            precision: 0, // No decimals
            step: 1,      // Increments by 1
            showStepperButtons: true,
            min: 1,       // Usually start at 1 for orders
            max: Infinity
          },
          valueParser: (params: any) => {
            const input = params.newValue;
            if (input === null || input === undefined || input === '') return 1;

            const newValue = parseInt(input, 10);
            if (isNaN(newValue)) return 1;

            return newValue < 1 ? 1 : newValue;
          },
          cellStyle: { overflow: 'visible' } as CellStyle
        };
      }

      // 3. PERCENT (For Discounts, Tax, Rates)
      if (col.type === 'inputPercent') {
        return {
          ...baseCol,
          editable: true,
          singleClickEdit: true,
          cellEditor: 'agNumberCellEditor',
          cellEditorParams: {
            precision: 2,
            step: 0.01,
            showStepperButtons: true,
            min: 0,
            max: 100
          },
          valueParser: (params: any) => {
            const input = params.newValue;
            if (input === null || input === undefined || input === '') return 0;

            const newValue = parseFloat(input);
            if (isNaN(newValue)) return 0;

            // Force clamp between 0 and 100
            if (newValue < 0) return 0;
            if (newValue > 100) return 100;

            return newValue;
          },
          cellStyle: { overflow: 'visible' } as CellStyle
        };
      }

      // TEXT COLUMNS (DEFAULT)
      return {
        ...baseCol, 
        filter: 'agTextColumnFilter',
        editable: false,
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
      return
    }
    if (event.colDef.field === 'deleteIcon') {
      this.delete.emit(event.data);
      return
    }
  }

  get rowSelectionConfig(): any {
    if (!this.enableRowSelection) return undefined;
    
    return { 
      mode: 'singleRow', 
      enableClickSelection: false 
    };
  }

  // Listen to native AG Grid selection changes
  onSelectionChanged(event: any): void {
    if (!this.enableRowSelection) return;

    const selectedRows = event.api.getSelectedRows();
    
    // Emit the selected row data, or null if they deselected it
    if (selectedRows.length > 0) {
      this.select.emit(selectedRows[0]);
    }
  }

  onCellValueChanged(params: any): void {
    this.inputValueChange.emit({ ...params.data });
  }

  onRefresh(): void {
    if (this.gridApi && this.enableFilter) {
      this.gridApi.setFilterModel(null);
    }

    if (this.gridApi && this.pagination) {
      this.gridApi.paginationGoToFirstPage();
    }

    this.refresh.emit();
  }

  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => {
    const d = params.data;

    // 1. Just check the 3 most common ID names you use. 
    // This is WAY faster than JSON.stringify and much more stable.
    const stableId = // d.invid || d.invoiceNumber || 
    // d.rid || d.receiptNumber || 
    d.icode || 
    d.id 
    // d.ccode
    ;

    if (stableId) return stableId.toString();

    // 2. If it's a new row with no ID, use a unique object property
    // This avoids the "re-draw everything" lag.
    return d.name ? `row-${d.name}` : `temp-${Math.random()}`;
  };
}