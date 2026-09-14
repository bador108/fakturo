export type VatRate = 0 | 12 | 21;

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export type Currency = 'CZK' | 'EUR' | 'USD';

export type ExpenseCategory =
  | 'kancelar'
  | 'software'
  | 'sluzby'
  | 'hardware'
  | 'cestovne'
  | 'marketing'
  | 'ostatni'
  | string;

export interface Client {
  id: string;
  user_id: string;
  name: string;
  ico?: string;
  dic?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  position: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: VatRate;
}

export interface InvoiceItemDraft {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: VatRate;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  variable_symbol?: string;
  constant_symbol?: string;
  status: InvoiceStatus;
  issue_date: string;
  duzp: string;
  due_date: string;
  
  // Dodavatel
  sender_name?: string;
  sender_ico?: string;
  sender_dic?: string;
  sender_street?: string;
  sender_city?: string;
  sender_zip?: string;
  sender_country?: string;
  sender_iban?: string;
  sender_swift?: string;
  sender_bank_name?: string;
  
  // Odběratel
  client_id?: string;
  client_name: string;
  client_ico?: string;
  client_dic?: string;
  client_street?: string;
  client_city?: string;
  client_zip?: string;
  client_country?: string;
  client_email?: string;

  // Částky
  currency: string;
  subtotal: number;
  vat_amount: number;
  total: number;
  vat_payer: boolean;
  reverse_charge: boolean;
  notes?: string;

  created_at?: string;
  updated_at?: string;

  invoice_items?: InvoiceItem[];
}

export interface CompanySettings {
  id?: string;
  user_id: string;
  company_name?: string;
  ico?: string;
  dic?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
  iban?: string;
  swift?: string;
  bank_name?: string;
  vat_payer?: boolean;
  default_due_days?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Expense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  vat_amount?: number;
  currency: Currency | string;
  category: ExpenseCategory;
  date: string;
  supplier?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
