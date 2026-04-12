export type Plan = 'free' | 'pro'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled'
export type InvoiceFilter = 'all' | 'sent' | 'paid' | 'overdue' | 'draft'
export type InvoiceType = 'faktura' | 'zalohova' | 'opravny' | 'nabidka'
export type VatRate = 0 | 15 | 21
export type Currency = 'CZK' | 'EUR' | 'USD'
export type RecurrenceType = 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type ExpenseCategory = 'kancelar' | 'cestovne' | 'software' | 'hardware' | 'marketing' | 'ostatni'

export interface Notification {
  id: string
  user_id: string
  type: 'overdue' | 'reminder' | 'paid' | 'system'
  title: string
  message: string
  invoice_id: string | null
  read: boolean
  created_at: string
}

export interface RecurringInvoice {
  id: string
  user_id: string
  name: string
  recurrence: RecurrenceType
  next_date: string
  is_active: boolean
  sender_name: string
  sender_address: string | null
  sender_city: string | null
  sender_zip: string | null
  sender_country: string
  sender_ico: string | null
  sender_dic: string | null
  sender_bank: string | null
  sender_iban: string | null
  sender_email: string | null
  sender_phone: string | null
  client_name: string
  client_address: string | null
  client_city: string | null
  client_zip: string | null
  client_country: string
  client_ico: string | null
  currency: Currency
  vat_rate: VatRate
  notes: string | null
  due_days: number
  items: Array<{ description: string; quantity: number; unit: string; unit_price: number }>
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name: string | null
  plan: Plan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  invoice_count_this_month: number
  invoice_count_reset_at: string
  created_at: string
  updated_at: string
}

export interface SenderProfile {
  id: string
  user_id: string
  name: string
  address: string | null
  city: string | null
  zip: string | null
  country: string
  ico: string | null
  dic: string | null
  bank_account: string | null
  iban: string | null
  email: string | null
  phone: string | null
  is_default: boolean
  created_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  position: number
  description: string
  quantity: number
  unit: string
  unit_price: number
  total: number
}

export interface Expense {
  id: string
  user_id: string
  date: string
  vendor: string
  description: string | null
  amount: number
  currency: Currency
  category: ExpenseCategory
  vat_claimable: boolean
  receipt_url: string | null
  created_at: string
}

export interface Invoice {
  id: string
  user_id: string
  invoice_number: string
  invoice_type: InvoiceType
  status: InvoiceStatus

  sender_name: string
  sender_address: string | null
  sender_city: string | null
  sender_zip: string | null
  sender_country: string
  sender_ico: string | null
  sender_dic: string | null
  sender_bank: string | null
  sender_iban: string | null
  sender_email: string | null
  sender_phone: string | null

  client_name: string
  client_address: string | null
  client_city: string | null
  client_zip: string | null
  client_country: string
  client_ico: string | null
  client_email: string | null

  issue_date: string
  due_date: string

  currency: Currency
  vat_rate: VatRate
  subtotal: number
  vat_amount: number
  total: number

  notes: string | null

  created_at: string
  updated_at: string

  invoice_items?: InvoiceItem[]
}

export interface ItemTemplate {
  id: string
  user_id: string
  name: string
  description: string
  unit: string
  unit_price: number
  created_at: string
}

// Form types (before save)
export interface InvoiceItemDraft {
  id?: string
  description: string
  quantity: number
  unit: string
  unit_price: number
}

export interface InvoiceFormData {
  invoice_type: InvoiceType

  // Sender
  sender_name: string
  sender_address: string
  sender_city: string
  sender_zip: string
  sender_country: string
  sender_ico: string
  sender_dic: string
  sender_bank: string
  sender_iban: string
  sender_email: string
  sender_phone: string

  // Client
  client_name: string
  client_address: string
  client_city: string
  client_zip: string
  client_country: string
  client_ico: string
  client_email: string

  // Meta
  invoice_number: string
  issue_date: string
  due_date: string
  currency: Currency
  vat_rate: VatRate
  notes: string

  // Items
  items: InvoiceItemDraft[]
}
