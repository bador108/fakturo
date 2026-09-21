export type VatRate = 0 | 12 | 21;

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export type InvoiceType = 'faktura' | 'zalohova' | 'opravny' | 'nabidka';

export type InvoiceFilter = 'all' | 'sent' | 'paid' | 'overdue' | 'draft';

export type PaymentMethod = 'bank_transfer' | 'cash' | 'card';

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
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  ico?: string;
  dic?: string;
  email?: string;
  phone?: string;
  notes?: string;
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
  total?: number;
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
  invoice_type: InvoiceType;
  variable_symbol?: string;
  constant_symbol?: string;
  public_token?: string;
  status: InvoiceStatus;
  issue_date: string;
  duzp?: string;
  due_date: string;

  // Dodavatel
  sender_name: string;
  sender_ico?: string;
  sender_dic?: string;
  sender_address?: string;
  sender_city?: string;
  sender_zip?: string;
  sender_country: string;
  sender_iban?: string;
  sender_bank?: string;
  sender_email?: string;
  sender_phone?: string;
  sender_logo_url?: string;
  sender_business_registry?: string;
  sender_web?: string;

  // Odběratel
  client_name: string;
  client_ico?: string;
  client_dic?: string;
  client_address?: string;
  client_city?: string;
  client_zip?: string;
  client_country: string;
  client_email?: string;

  // Částky (vat_rate zůstává jen jako legacy/hlavičkový údaj — skutečný rozpad DPH
  // se počítá per položka z invoice_items.vat_rate, viz lib/utils.ts#calcTotals)
  currency: string;
  vat_rate?: VatRate | null;
  subtotal: number;
  vat_amount: number;
  total: number;
  vat_payer: boolean;
  reverse_charge: boolean;
  payment_method?: PaymentMethod;
  notes?: string;
  accent_color?: string;

  created_at?: string;
  updated_at?: string;

  invoice_items?: InvoiceItem[];
}

// Tvar formuláře pro vytvoření/editaci faktury (InvoiceForm, generator/page.tsx)
export interface InvoiceFormData {
  invoice_type: InvoiceType;
  sender_name: string;
  sender_address: string;
  sender_city: string;
  sender_zip: string;
  sender_country: string;
  sender_ico: string;
  sender_dic: string;
  sender_bank: string;
  sender_iban: string;
  sender_email: string;
  sender_phone: string;
  sender_logo_url: string;
  sender_business_registry: string;
  sender_web: string;
  client_name: string;
  client_address: string;
  client_city: string;
  client_zip: string;
  client_country: string;
  client_ico: string;
  client_dic: string;
  client_email: string;
  invoice_number: string;
  issue_date: string;
  duzp: string;
  due_date: string;
  variable_symbol: string;
  payment_method: PaymentMethod;
  currency: Currency;
  vat_payer: boolean;
  reverse_charge: boolean;
  notes: string;
  items: InvoiceItemDraft[];
  accent_color?: string;
}

export interface SenderProfile {
  id: string;
  user_id: string;
  name: string;
  address?: string;
  city?: string;
  zip?: string;
  country: string;
  ico?: string;
  dic?: string;
  bank_account?: string;
  iban?: string;
  email?: string;
  phone?: string;
  accent_color?: string;
  logo_url?: string;
  business_registry?: string;
  web?: string;
  is_default: boolean;
  created_at?: string;
}

export interface RecurringInvoice {
  id: string;
  user_id: string;
  name: string;
  recurrence: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_date: string;
  is_active: boolean;
  sender_name: string;
  sender_address?: string;
  sender_city?: string;
  sender_zip?: string;
  sender_country: string;
  sender_ico?: string;
  sender_dic?: string;
  sender_bank?: string;
  sender_iban?: string;
  sender_email?: string;
  sender_phone?: string;
  client_name: string;
  client_address?: string;
  client_city?: string;
  client_zip?: string;
  client_country: string;
  client_ico?: string;
  client_dic?: string;
  client_email?: string;
  currency: string;
  vat_rate: VatRate;
  notes?: string;
  due_days: number;
  items: InvoiceItemDraft[];
  created_at?: string;
  updated_at?: string;
}

export interface ItemTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string;
  unit: string;
  unit_price: number;
  created_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'overdue' | 'reminder' | 'paid' | 'system';
  title: string;
  message: string;
  invoice_id?: string;
  read: boolean;
  created_at?: string;
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
  vat_claimable?: boolean;
  currency: Currency | string;
  category: ExpenseCategory;
  date: string;
  vendor?: string;
  notes?: string;
  receipt_url?: string | null;
  source?: 'manual' | 'email';
  needs_review?: boolean;
  created_at?: string;
  updated_at?: string;
}
