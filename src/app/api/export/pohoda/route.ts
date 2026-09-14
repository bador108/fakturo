import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import type { Invoice, InvoiceItem } from '@/types';

function escapeXml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const year = url.searchParams.get('year') ?? new Date().getFullYear().toString();

  const db = createServiceClient();
  const { data, error } = await db
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .gte('issue_date', `${year}-01-01`)
    .lte('issue_date', `${year}-12-31`)
    .order('issue_date', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const invoices = (data ?? []) as (Invoice & { invoice_items: InvoiceItem[] })[];

  const invoiceXml = invoices.map(inv => {
    const items = (inv.invoice_items ?? []).map(item => {
      const rate = item.vat_rate ?? 21;
      const rateVAT = rate === 0 ? 'none' : rate === 12 ? 'low' : 'high';
      return `
        <invoiceItem>
          <text>${escapeXml(item.description)}</text>
          <quantity>${item.quantity}</quantity>
          <unit>${escapeXml(item.unit)}</unit>
          <unitPrice>${Number(item.unit_price).toFixed(2)}</unitPrice>
          <rateVAT>${rateVAT}</rateVAT>
        </invoiceItem>`;
    }).join('');

    return `
    <invoice version="2.0">
      <invoiceHeader>
        <invoiceType>issuedInvoice</invoiceType>
        <number>
          <numberRequested>${escapeXml(inv.invoice_number)}</numberRequested>
        </number>
        <date>${inv.issue_date?.slice(0, 10)}</date>
        <dateTax>${(inv.duzp || inv.issue_date)?.slice(0, 10)}</dateTax>
        <dateDue>${inv.due_date?.slice(0, 10)}</dateDue>
        <text>Faktura č. ${escapeXml(inv.invoice_number)}</text>
        <partnerIdentity>
          <address>
            <company>${escapeXml(inv.client_name)}</company>
            <street>${escapeXml(inv.client_address)}</street>
            <city>${escapeXml(inv.client_city)}</city>
            <zip>${escapeXml(inv.client_zip)}</zip>
            <ico>${escapeXml(inv.client_ico)}</ico>
            <dic>${escapeXml(inv.client_dic)}</dic>
          </address>
        </partnerIdentity>
        <myIdentity>
          <address>
            <company>${escapeXml(inv.sender_name)}</company>
            <street>${escapeXml(inv.sender_address)}</street>
            <city>${escapeXml(inv.sender_city)}</city>
            <zip>${escapeXml(inv.sender_zip)}</zip>
            <ico>${escapeXml(inv.sender_ico)}</ico>
            <dic>${escapeXml(inv.sender_dic)}</dic>
          </address>
        </myIdentity>
        <account>
          <accountNo>${escapeXml(inv.sender_bank)}</accountNo>
          <iban>${escapeXml(inv.sender_iban)}</iban>
        </account>
        <symVar>${escapeXml(inv.variable_symbol || inv.invoice_number)}</symVar>
        <paymentType>${inv.payment_method === 'cash' ? 'cash' : inv.payment_method === 'card' ? 'draft' : 'draft'}</paymentType>
        <note>${escapeXml(inv.notes)}</note>
      </invoiceHeader>
      <invoiceDetail>${items}
      </invoiceDetail>
    </invoice>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<dataPack
  id="fakturo-export-${year}"
  ico="${escapeXml(invoices[0]?.sender_ico ?? '')}"
  application="Fakturo"
  version="2.0"
  xmlns="http://www.stormware.cz/schema/version_2/data.xsd"
>
  <dataPackItem id="1" version="2.0">
    <inv:invoices version="2.0" xmlns:inv="http://www.stormware.cz/schema/version_2/invoice.xsd">
      ${invoiceXml}
    </inv:invoices>
  </dataPackItem>
</dataPack>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="faktury-pohoda-${year}.xml"`,
    },
  });
}
