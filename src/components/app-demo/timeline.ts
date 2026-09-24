// Scénář prohlídky desktopové appky (sekundy). Stejně jako v telefonu je všechno
// čistá funkce času `t`, takže kurzor, obrazovky i menu vlevo jsou vždy v souladu.
import { LayoutDashboard, FileText, Users, Receipt, RefreshCw, Bell } from 'lucide-react'

export { seg, easeOut, easeInOut, typed, czk } from '../phone-demo/timeline'

export const LOOP = 31

export const PAGES = [
  { id: 'dashboard', from: 0, path: 'dashboard', icon: LayoutDashboard, title: 'Přehled na první pohled', desc: 'Příjmy, výdaje, zisk i to, co čeká na platbu. Graf za rok a výdaje podle kategorií.' },
  { id: 'invoices', from: 5.2, path: 'invoices', icon: FileText, title: 'Všechny faktury', desc: 'Jedním klikem vidíš, co je zaplacené, odeslané nebo po splatnosti.' },
  { id: 'clients', from: 10.4, path: 'clients', icon: Users, title: 'Adresář klientů', desc: 'Firmu najdeš podle názvu, IČO i e‑mailu. Údaje doplní ARES.' },
  { id: 'expenses', from: 15.0, path: 'expenses', icon: Receipt, title: 'Výdaje bez přepisování', desc: 'Napíšeš jednu větu z účtenky a Fakturo doplní dodavatele, částku i kategorii.' },
  { id: 'recurring', from: 21.2, path: 'recurring', icon: RefreshCw, title: 'Opakující se faktury', desc: 'Měsíční paušál nebo roční licence se vystaví a odešlou samy podle plánu.' },
  { id: 'reminders', from: 25.6, path: 'settings', icon: Bell, title: 'Upomínky', desc: 'Vybereš tón a dny. Klient dostane slušnou upomínku e‑mailem, ty nepíšeš nic.' },
] as const

export type PageId = (typeof PAGES)[number]['id']

export function pageAt(t: number): number {
  let i = 0
  PAGES.forEach((p, j) => { if (t >= p.from) i = j })
  return i
}

export const T = {
  statsIn: [0.2, 1.4],
  chartIn: [0.4, 1.7],
  filterOverdue: 7.4,
  searchType: [11.9, 12.5],
  quickType: [16.0, 17.4],
  parse: 17.8,
  modalIn: 18.3,
  save: 19.75,
  rowIn: [20.1, 20.6],
  toggleOn: 23.0,
  settingsScroll: [26.0, 26.6],
  toneFormal: 26.9,
  checkDay: 28.0,
  saveReminders: 29.0,
  fadeOut: [30.4, LOOP],
} as const

// Kurzor: body (souřadnice v okně appky 1120×700), mezi nimi plynulý přesun.
// `hand` = nad klikatelným prvkem, `click` = v tu chvíli klik.
export interface CursorPoint { t: number; x: number; y: number; hand?: boolean; click?: boolean }
