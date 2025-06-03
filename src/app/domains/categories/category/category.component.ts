import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from './category.service';
import { Category, CategoryCreate } from '../../../models/category.model';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CategoryComponent implements OnInit {
  categories: Category[] = [];
  
  // Para el formulario/modal
  selectedCategory: Partial<Category> = {};
  editMode: boolean = false;
  categoryDialog: boolean = false;
  categoryDialogTitle: string = 'Nueva Categoría';

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error cargando categorías:', error);
        alert('Error al cargar las categorías');
      }
    });
  }

  openNew() {
    this.resetForm();
    this.categoryDialog = true;
    this.categoryDialogTitle = 'Nueva Categoría';
  }

  editCategory(category: Category) {
    this.selectedCategory = { ...category };
    this.editMode = true;
    this.categoryDialog = true;
    this.categoryDialogTitle = 'Editar Categoría';
  }

  deleteCategory(category: Category) {
    if (confirm(`¿Seguro que deseas eliminar la categoría "${category.nombre}"?`)) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          alert('Categoría eliminada correctamente');
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error eliminando categoría:', error);
          alert('Error al eliminar la categoría');
        }
      });
    }
  }

  saveCategory() {
    if (this.editMode) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  createCategory() {
    const categoryData: CategoryCreate = {
      nombre: this.selectedCategory.nombre || '',
      descripcion: this.selectedCategory.descripcion || ''
    };

    if (!categoryData.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    this.categoryService.createCategory(categoryData).subscribe({
      next: () => {
        alert('Categoría creada correctamente');
        this.loadCategories();
        this.hideDialog();
      },
      error: (error) => {
        console.error('Error creando categoría:', error);
        alert('Error al crear la categoría');
      }
    });
  }

  updateCategory() {
    if (!this.selectedCategory.id) return;

    const categoryData: CategoryCreate = {
      nombre: this.selectedCategory.nombre || '',
      descripcion: this.selectedCategory.descripcion || ''
    };

    if (!categoryData.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    this.categoryService.updateCategory(this.selectedCategory.id, categoryData).subscribe({
      next: () => {
        alert('Categoría actualizada correctamente');
        this.loadCategories();
        this.hideDialog();
      },
      error: (error) => {
        console.error('Error actualizando categoría:', error);
        alert('Error al actualizar la categoría');
      }
    });
  }

  hideDialog() {
    this.categoryDialog = false;
    this.resetForm();
  }

  resetForm() {
    this.selectedCategory = {};
    this.editMode = false;
  }
}