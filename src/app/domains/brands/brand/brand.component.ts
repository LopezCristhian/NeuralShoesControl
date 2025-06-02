import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrandService } from '../../../services/brand.service';
import { Brand } from '../../../models/brand.model';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss']
})
export class BrandComponent implements OnInit {
  brands: Brand[] = [];
  brand: Partial<Brand> = {};
  logoFile: File | null = null;
  logoPreview: string | null = null;
  editing: boolean = false;
  editingId: string | null = null;
  showAddForm: boolean = false;

  constructor(private brandService: BrandService) {}

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands() {
    this.brandService.getBrands().subscribe(data => {
      this.brands = data;
    });
  }

  onLogoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.logoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = e => this.logoPreview = reader.result as string;
      reader.readAsDataURL(this.logoFile);
    }
  }

  removeLogo() {
    this.logoFile = null;
    this.logoPreview = null;
    if (this.editing) this.brand.imagen = null;
  }

  editBrand(brand: Brand) {
    this.editing = true;
    this.editingId = brand.id;
    this.brand = { ...brand };
    this.logoPreview = brand.imagen || null;
    this.logoFile = null;
    this.showAddForm = false;
  }

  cancelEdit() {
    this.editing = false;
    this.editingId = null;
    this.brand = {};
    this.logoFile = null;
    this.logoPreview = null;
  }

  deleteBrand(brand: Brand) {
    if (confirm(`¿Eliminar la marca "${brand.nombre}"?`)) {
      this.brandService.deleteBrand(brand.id).subscribe(() => {
        this.loadBrands();
        this.cancelEdit();
      });
    }
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('nombre', this.brand.nombre || '');
    formData.append('descripcion', this.brand.descripcion || '');
    if (this.logoFile) {
      formData.append('imagen', this.logoFile);
    }

    if (this.editing && this.editingId) {
      this.brandService.updateBrand(this.editingId, formData).subscribe(() => {
        this.loadBrands();
        this.cancelEdit();
      });
    } else {
      this.brandService.createBrand(formData).subscribe(() => {
        this.loadBrands();
        this.cancelEdit();
        this.showAddForm = false;
      });
    }
  }
}