// ANGULAR
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ViewChild } from '@angular/core';

// MATERIAL UI
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';


@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements AfterViewInit{

  @Input({ required: true }) columns!: { key: string; label: string }[];
  @Input({ required: true }) data!: any[];
  @Input({ required: true }) loading!: boolean;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly dataSource = new MatTableDataSource<any>();

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(): void {
    this.dataSource.data = this.data ?? [];
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
