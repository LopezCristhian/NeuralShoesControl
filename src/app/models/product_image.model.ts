export interface ProductImage { 
    id: string;
    imagen: string; // URL de la imagen del producto
    producto: string | number; // ID del producto al que pertenece la imagen (flexible)
}