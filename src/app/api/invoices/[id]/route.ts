import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
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

    // Aktualizace faktury
    const { error: updateError } = await db
      .from('invoices')
      .update({
        ...invoiceData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('user_id', userId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
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
