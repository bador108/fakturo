import { randomBytes } from 'crypto'

// Doména, na kterou míří příchozí pošta s účtenkami. Je to poddoména, protože kořenová doména
// už má vlastní MX záznamy pro běžnou poštu.
export const INBOX_DOMAIN = (process.env.INBOUND_EXPENSE_DOMAIN ?? 'uctenky.fakturo.online').toLowerCase()

export const newInboxToken = () => randomBytes(8).toString('hex')

export const inboxAddress = (token: string) => `${token}@${INBOX_DOMAIN}`

// Z adres příjemců ("Jméno <abc@uctenky...>" nebo jen "abc@uctenky...") vytáhne token uživatele.
export function tokenFromRecipients(recipients: string[]): string | null {
  for (const raw of recipients) {
    const m = raw.trim().match(/<?([^<>\s@]+)@([^<>\s@]+?)>?$/)
    if (m && m[2].toLowerCase() === INBOX_DOMAIN) return m[1].toLowerCase()
  }
  return null
}

// "Adobe Inc." <billing@adobe.com> -> Adobe Inc.; když jméno chybí, vezme se název domény.
export function senderName(from: string): string {
  const named = from.match(/^\s*"?([^"<]+?)"?\s*</)
  if (named && named[1].trim().length >= 2) return named[1].trim().slice(0, 80)
  const domain = from.match(/@([^>\s]+)/)?.[1]
  if (!domain) return 'E-mail'
  const parts = domain.replace(/^(mail|billing|invoice|invoices|noreply|no-reply|email)\./i, '').split('.')
  const base = parts.length >= 2 ? parts[parts.length - 2] : parts[0]
  return base.charAt(0).toUpperCase() + base.slice(1)
}

const ENTITIES: Record<string, string> = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" }

export function htmlToText(html: string): string {
  return html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|tr|li|h[1-6])>|<br\s*\/?>/gi, '\n')
    .replace(/<\/t[dh]>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, m => ENTITIES[m] ?? m)
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim()
}
