import { escapeHtml as esc } from '@/lib/utils'

interface BrandedEmailOptions {
  senderName: string
  senderLogoUrl?: string | null
  bodyHtml: string
}

/** Společná obálka pro emaily posílané klientům jménem uživatele (faktura, upomínka) — logo dodavatele nahoře, pokud ho má, jinak jen jméno. */
export function renderBrandedEmail({ senderName, senderLogoUrl, bodyHtml }: BrandedEmailOptions): string {
  const header = senderLogoUrl
    ? `<img src="${esc(senderLogoUrl)}" alt="${esc(senderName)}" style="max-height:40px;max-width:220px;display:block" />`
    : `<span style="font-size:16px;font-weight:700;color:#0c0c0e">${esc(senderName)}</span>`

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;background:#ffffff">
      <div style="padding:24px 24px 20px;border-bottom:3px solid #16a34a">
        ${header}
      </div>
      <div style="padding:28px 24px;color:#1e293b">
        ${bodyHtml}
      </div>
      <div style="padding:16px 24px 28px;color:#94a3b8;font-size:11px;border-top:1px solid #f1f5f9">
        Odesláno přes <a href="https://fakturo.online" style="color:#16a34a;text-decoration:none">Fakturo</a> — fakturace pro OSVČ a freelancery.
      </div>
    </div>
  `
}
