export interface Empresa {
  id: number;
  fiscal_name: string;
  commercial_name: string | null;
  cif_nif: string;
  email: string;
  address: string;
  phone: string;
  phone2: string | null;
  city: string;
  province: string;
  postal_code: string;
  logo: string | null;
  active: boolean;
  max_users: number;
}

export interface AltaEmpresaPayload {
  fiscal_name: string;
  commercial_name?: string;
  cif_nif: string;
  email: string;
  address: string;
  phone: string;
  phone2?: string;
  city: string;
  province: string;
  postal_code: string;
  max_users?: number;
  admin_name: string;
  admin_email: string;
  admin_password: string;
  admin_dni: string;
  admin_phone?: string;
  admin_address?: string;
  admin_city?: string;
  admin_province?: string;
}
