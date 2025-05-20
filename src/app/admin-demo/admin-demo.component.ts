import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-demo',
  standalone: true,
  imports: [MatCardModule, MatTableModule, MatButtonModule],
  templateUrl: './admin-demo.component.html',
  styleUrls: ['./admin-demo.component.scss']
})
export class AdminDemoComponent {
  displayedColumns: string[] = ['nombre', 'rol', 'acciones'];
  dataSource = [
    { nombre: 'Juan', rol: 'Administrador' },
    { nombre: 'Ana', rol: 'Usuario' }
  ];
}