import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component'; // 👈 Importa tu componente
import { PieComponent  } from './pie/pie.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, PieComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'NeuralShoesControl';

  
}
