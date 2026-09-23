import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getEffectivePlan } from '@/lib/stripe';
import { isPaid } from '@/lib/plan';
import { generateInvoiceNumber } from '@/lib/utils';
import type { InvoiceItemDraft } from '@/types';

// GET /api/invoices/[id] - Načtení detailu faktury
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createServiceClient();

  const { data, error } = await db
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT /api/invoices/[id] - Úprava faktury
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { items, ...invoiceData } = body;

    const db = createServiceClient();

    // Ověření, že faktura patří přihlášenému uživateli
    const { data: existing } = await db
      .from('invoices')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoiceData.invoice_type === 'nabidka' || (invoiceData.currency && invoiceData.currency !== 'CZK')) {
      const { data: user } = await db.from('users').select('plan, email').eq('id', userId).single();
      const effectivePlan = getEffectivePlan(user?.plan ?? 'free', user?.email);
      if (invoiceData.invoice_type === 'nabidka' && !isPaid(effectivePlan)) {
        return NextResponse.json({ error: 'Cenové nabídky jsou součástí Start a Pro plánu.', code: 'START_REQUIRED' }, { status: 403 });
      }
      if (invoiceData.currency && invoiceData.currency !== 'CZK' && !isPaid(effectivePlan)) {
        return NextResponse.json({ error: 'Fakturace v cizí měně je součástí Start a Pro plánu.', code: 'START_REQUIRED' }, { status: 403 });
      }
    }

    // Aktualizace faktury — invoice_number může kolidovat (dvě otevřené záložky,
    // souběh s cron generováním opakovaných faktur), radši to vyřešit automaticky
    // přeplánováním čísla než poslat uživateli syrovou DB chybu.
    let updateError;
    let attemptNumber = invoiceData.invoice_number;
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await db
        .from('invoices')
        .update({
          ...invoiceData,
          invoice_number: attemptNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)
        .eq('user_id', userId);
      updateError = result.error;
      if (!updateError) break;
      if (updateError.code !== '23505') break;

      const { data: lastInvoice } = await db
        .from('invoices')
        .select('invoice_number')
        .eq('user_id', userId)
        .neq('id', params.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      attemptNumber = generateInvoiceNumber(lastInvoice?.invoice_number);
    }

    if (updateError) {
      const isDuplicate = updateError.code === '23505';
      return NextResponse.json(
        { error: isDuplicate ? 'Toto číslo faktury už používáte.' : updateError.message, code: isDuplicate ? 'DUPLICATE_NUMBER' : undefined },
        { status: isDuplicate ? 409 : 500 }
      );
    }

    // Aktualizace položek faktury (smazání starých a vložení nových)
    if (Array.isArray(items)) {
      await db.from('invoice_items').delete().eq('invoice_id', params.id);

      if (items.length > 0) {
        const newItems = items.map((item: InvoiceItemDraft, index: number) => ({
          invoice_id: params.id,
          position: index,
          description: item.description,
          quantity: Number(item.quantity) || 0,
          unit: item.unit || 'ks',
          unit_price: Number(item.unit_price) || 0,
          vat_rate: item.vat_rate ?? 21,
        }));

        const { error: itemsError } = await db
          .from('invoice_items')
          .insert(newItems);

        if (itemsError) {
          return NextResponse.json({ error: itemsError.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true, id: params.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/invoices/[id] - Smazání faktury
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createServiceClient();

  // Smazání navázaných položek
  await db.from('invoice_items').delete().eq('invoice_id', params.id);

  // Smazání faktury
  const { error } = await db
    .from('invoices')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
