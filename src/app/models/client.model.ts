export interface Cliente {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string | null;
  direccion?: string | null;
  fecha_registro: string;
}
