export type VatRate = 0 | 12 | 21;

export type PaymentMethod = 'bank_transfer' | 'cash' | 'card';

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
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: VatRate;
  aiSuggested?: boolean;
  aiReason?: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  variable_symbol?: string;
  issue_date: string;
  due_date: string;
  duzp: string;
  payment_method: PaymentMethod;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  
  // Dodavatel
  sender_name: string;
  sender_address: string;
  sender_city: string;
  sender_zip: string;
  sender_ico: string;
  sender_dic?: string;
  sender_bank?: string;
  sender_iban?: string;
  
  // Odběratel
  client_name: string;
  client_address: string;
  client_city: string;
  client_zip: string;
  client_ico?: string;
  client_dic?: string;
  client_email?: string;
  
  // DPH a finance
  vat_payer: boolean;
  reverse_charge: boolean;
  currency: string;
  subtotal: number;
  vat_amount: number;
  total: number;
  notes?: string;
  
  created_at?: string;
  updated_at?: string;
  invoice_items?: InvoiceItem[];
}

export interface InvoiceFormData extends Omit<Invoice, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at' | 'invoice_items'> {
  items: InvoiceItemDraft[];
}
