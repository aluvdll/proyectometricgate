export interface Cliente {
  id: number;
  nombre: string;
  apellido1: string;
  apellido2: string;
  correo_electronico: string;
  password?: string;
  telefono: string;
  codigo_postal: string;
  poblacion: string;
  calle: string;
  provincia: string;
  pais: string;
  dni: string;
  email?: string;
}