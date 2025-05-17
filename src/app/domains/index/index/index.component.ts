import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index',
  standalone: true,
  templateUrl: './index.component.html'
})
export class IndexComponent {
  constructor(private router: Router) {}

  goToProducts() {
    this.router.navigate(['/productos']);
  }
}