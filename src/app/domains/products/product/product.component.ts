import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { ImagenTallaColorService } from '../../../services/imagen-talla-color.service';
import { Product, ProductoCreate } from '../../../models/product.model';
import { ProductoTallaColorCreate } from '../../../models/product_talla_color.model';
import { ProductImage } from '../../../models/product_image.model';
import { Brand } from '../../../models/brand.model';
import { Color } from '../../../models/color.model';
import { Size } from '../../../models/size.model';
import { BrandService } from '../../../services/brand.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  products: Product[] = [];
  brands: Brand[] = [];
  colors: Color[] = [];
  sizes: Size[] = [];

  // Para el formulario/modal
  selectedProduct: Partial<Product> = {};
  marcaId: string = '';
  colorId: string = '';
  tallaNumero: string = '';
  stockCombo: number | null = null;
  combinaciones: { color: Color, talla: Size, stock: number }[] = [];
  imagenActual: ProductImage | null = null;
  editMode: boolean = false;
  productDialog: boolean = false;
  productDialogTitle: string = 'Nuevo Producto';

  // Modal de imágenes por producto
  imageModalOpen: boolean = false;
  imagenesModal: ProductImage[] = [];
  nuevasImagenesModal: File[] = [];
  productoImagenesId: string | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private productService: ProductService,
    private imagenTallaColorService: ImagenTallaColorService,
    private brandService: BrandService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadBrands();
    this.loadColors();
    this.loadSizes();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
  }

  loadBrands() {
    this.brandService.getBrands().subscribe(brands => this.brands = brands);
  }

  loadColors() {
    this.imagenTallaColorService.getColors().subscribe(colors => this.colors = colors);
  }

  loadSizes() {
    this.imagenTallaColorService.getSizes().subscribe(sizes => this.sizes = sizes);
  }

  openNew() {
    this.resetForm();
    this.productDialog = true;
    this.productDialogTitle = 'Nuevo Producto';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  hideDialog() {
    this.productDialog = false;
    this.resetForm();
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  saveProduct() {
    if (this.editMode) {
      this.onEdit();
    } else {
      this.onCreate();
    }
  }

  // Modal de imágenes por producto
  openImageModal(product: Product) {
    this.productoImagenesId = product.id!;
    this.nuevasImagenesModal = [];
    this.imagenesModal = [];
    this.imagenTallaColorService.getProductImages(product.id!).subscribe(imgs => {
      this.imagenesModal = imgs;
      this.imageModalOpen = true;
    });
  }

  closeImageModal() {
    this.imageModalOpen = false;
    this.imagenesModal = [];
    this.nuevasImagenesModal = [];
    this.productoImagenesId = null;
  }

  onAddImageToModal(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.nuevasImagenesModal = [...this.nuevasImagenesModal, ...Array.from(input.files)];
    }
  }

  uploadImagesToProduct() {
    if (!this.productoImagenesId || !this.nuevasImagenesModal.length) return;
    let subidas = 0;
    for (const file of this.nuevasImagenesModal) {
      this.imagenTallaColorService.uploadProductImage(this.productoImagenesId, file).subscribe(() => {
        subidas++;
        if (subidas === this.nuevasImagenesModal.length) {
          this.imagenTallaColorService.getProductImages(this.productoImagenesId!).subscribe(imgs => {
            this.imagenesModal = imgs;
            this.nuevasImagenesModal = [];
          });
        }
      });
    }
  }

  eliminarImagenModal(img: ProductImage) {
    if (confirm('¿Eliminar esta imagen?')) {
      this.imagenTallaColorService.deleteProductImage(this.productoImagenesId!, img.id).subscribe(() => {
        this.imagenesModal = this.imagenesModal.filter(i => i.id !== img.id);
      });
    }
  }

  // Cuando abras el modal para editar, carga solo los datos y combinaciones (no imágenes)
  editProduct(product: Product) {
    this.selectedProduct = { ...product };
    this.marcaId = product.marca?.id || '';
    this.combinaciones = [];
    this.imagenActual = null;
    this.editMode = true;
    this.productDialog = true;
    this.productDialogTitle = 'Editar Producto';
    this.imagenTallaColorService.getPTCByProduct(product.id!).subscribe(ptcs => {
      this.combinaciones = ptcs.map(ptc => ({
        color: ptc.color,
        talla: ptc.talla,
        stock: ptc.stock
      }));
    });
    // Cargar imágenes del producto al editar
    this.productoImagenesId = product.id!;
    this.imagenTallaColorService.getProductImages(product.id!).subscribe(imgs => {
      this.imagenesModal = imgs;
      this.nuevasImagenesModal = [];
    });
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  deleteProduct(product: Product) {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      this.selectedProduct = { ...product };
      this.onDelete();
    }
  }

  // Agregar combinación a la tabla
  addCombo() {
    const color = this.colors.find(c => c.id === this.colorId);
    let talla = this.sizes.find(t => t.numero === this.tallaNumero);
    if (!talla && this.tallaNumero) {
      talla = { id: this.tallaNumero, numero: this.tallaNumero };
    }
    if (color && talla && this.stockCombo != null && this.stockCombo >= 0) {
      const exists = this.combinaciones.some(c => c.color.id === color.id && c.talla.numero === talla!.numero);
      if (!exists) {
        this.combinaciones.push({ color, talla, stock: this.stockCombo });
      }
    }
    this.colorId = '';
    this.tallaNumero = '';
    this.stockCombo = null;
  }

  removeCombo(index: number) {
    this.combinaciones.splice(index, 1);
  }

  // Crear producto y combinaciones
  onCreate() {
    const stock_total = this.getStockTotal();
    const productCreate: ProductoCreate = {
      nombre: this.selectedProduct.nombre || '',
      descripcion: this.selectedProduct.descripcion || '',
      precio: this.selectedProduct.precio || 0,
      stock_total: stock_total,
      marca_id: this.marcaId
    };
    if (!productCreate.nombre || !productCreate.precio || !this.marcaId) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
    this.productService.createProduct(productCreate).subscribe((productoCreado: Product) => {
      const ptcRequests = [];
      for (const combo of this.combinaciones) {
        const ptc: any = {
          producto_id: productoCreado.id,
          tallas_ids: combo.talla.id,
          color_id: combo.color.id,
          stock: combo.stock
        };
        ptcRequests.push(this.imagenTallaColorService.createPTC(ptc));
      }
      Promise.all(ptcRequests.map(req => req.toPromise())).then(() => {
        alert('Creado correctamente');
        this.loadProducts();
        this.hideDialog();
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
      });
    });
  }

  // Editar producto (puedes adaptar para editar combinaciones si tu backend lo permite)
  onEdit() {
    if (!this.selectedProduct.id) return;
    const stock_total = this.getStockTotal();
    const productUpdate: ProductoCreate = {
      nombre: this.selectedProduct.nombre || '',
      descripcion: this.selectedProduct.descripcion || '',
      precio: this.selectedProduct.precio || 0,
      stock_total: stock_total,
      marca_id: this.marcaId
    };
    this.productService.updateProduct(this.selectedProduct.id, productUpdate).subscribe(() => {
      alert('Editado correctamente');
      this.loadProducts();
      this.hideDialog();
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    });
  }

  getStockTotal(): number {
    return this.combinaciones.reduce((acc, c) => acc + (c.stock || 0), 0);
  }

  onDelete() {
    if (!this.selectedProduct.id) return;
    this.productService.deleteProduct(this.selectedProduct.id!).subscribe(() => {
      alert('Eliminado correctamente');
      this.loadProducts();
      this.hideDialog();
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    });
  }

  resetForm() {
    this.selectedProduct = {};
    this.imagenActual = null;
    this.marcaId = '';
    this.tallaNumero = '';
    this.colorId = '';
    this.stockCombo = null;
    this.editMode = false;
    this.combinaciones = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}