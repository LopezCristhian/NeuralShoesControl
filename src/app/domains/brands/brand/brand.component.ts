import { Component, OnInit } from '@angular/core';
import { BrandService } from './brand.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class BrandComponent implements OnInit {
  brands: any[] = [];

  constructor(private brandService: BrandService) {}

  ngOnInit(): void {
    this.brandService.getBrands().subscribe(data => {
      this.brands = data;
    });
  }
}