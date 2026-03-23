import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Breadcrumb } from '../models/breadcrumb.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterModule, CommonModule, MatIconModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {

  @Input({ required: true })
  public items: Breadcrumb[] = [];

  private readonly MAX_LENGTH = 15;

  public getTruncatedLabel(label: string): string {
    return label.length > this.MAX_LENGTH
      ? `${label.slice(0, this.MAX_LENGTH)}...`
      : label;
  }
}