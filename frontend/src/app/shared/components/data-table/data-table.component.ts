import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {

  @Input({ required: true }) columns!: { key: string; label: string }[];
  @Input({ required: true }) data!: any[];
  @Input({ required: true }) loading!: boolean;
  @Input() pageSize: number = 10;


  get columnKeys(): string[] {
    return this.columns.map(c => c.key);
  }

  get visibleData(): any[] {
    return this.data?.slice(0, this.pageSize) ?? [];
  }
}
