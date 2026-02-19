import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SnackbarService } from '../../core/services/snackbar/snackbar.service'

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    MatButtonModule, 
    RouterModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {

  private readonly snackbar = inject(SnackbarService);

  ngOnInit(){
    console.log("hello");
    this.snackbar.success('TEST SNACKBAR :>', 6000)
  }
}
