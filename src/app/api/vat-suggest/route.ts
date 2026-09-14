import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { description } = await req.json();
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ vat_rate: 21, reason: 'Výchozí sazba' });
    }

    const text = description.toLowerCase().trim();

    if (/\b(kniha|knihy|ebook|e-kniha|monografie|učebnice)\b/.test(text)) {
      return NextResponse.json({
        vat_rate: 0,
        reason: 'Knihy a obrázkové knížky podléhají 0% sazbě DPH.',
        confidence: 'high',
      });
    }

    if (/\b(ubytování|hotel|penzion|oběd|večeře|stravování|potraviny|léky|zdravotní|voda|vodné|stočné|jízdné|doprava osob)\b/.test(text)) {
      return NextResponse.json({
        vat_rate: 12,
        reason: 'Ubytovací, stravovací nebo vybrané základní služby podléhají snížené sazbě 12 %.',
        confidence: 'high',
      });
    }

    return NextResponse.json({
      vat_rate: 21,
      reason: 'Standardní sazba 21 % pro služby, IT, poradenství a většinu zboží.',
      confidence: 'medium',
    });
  } catch {
    return NextResponse.json({ vat_rate: 21, reason: 'Chyba při vyhodnocení' });
  }
}
