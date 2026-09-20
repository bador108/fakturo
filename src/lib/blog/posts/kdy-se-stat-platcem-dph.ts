import type { Post } from '../types'

export const kdyStatPlatcemDph: Post = {
  slug: 'kdy-se-stat-platcem-dph',
  title: 'Kdy se OSVČ musí stát plátcem DPH',
  description:
    'Limit obratu pro povinnou registraci k DPH, do kdy podat přihlášku, od kdy jsi plátcem a co se změní na fakturách.',
  category: 'DPH',
  published: '2026-09-21',
  related: ['nalezitosti-faktury', 'faktura-neplatce-dph', 'zalohova-faktura-nebo-danovy-doklad'],
  blocks: [
    {
      t: 'p',
      text: 'Dokud jsi neplátce, fakturuješ bez DPH a nemáš s ní žádnou administrativu. Jakmile tržby dosáhnou limitu, registrace k DPH je povinná. Chyba se tu vyplatí opravdu draze, protože DPH by se ti počítalo zpětně z faktur, které jsi už vystavil bez ní.',
    },
    { t: 'h2', text: 'Limit dva miliony korun' },
    {
      t: 'p',
      text: 'Od roku 2025 se plátcem DPH musíš stát, když tvůj obrat za nejvýše dvanáct po sobě jdoucích kalendářních měsíců přesáhne **2 000 000 Kč**. Do konce roku 2024 platil limit milion korun. Počítají se tržby z činnosti, ne zisk, a dvanáct měsíců se sleduje průběžně, ne jen za kalendářní rok.',
    },
    { t: 'h2', text: 'Do kdy se přihlásit a od kdy platíš' },
    {
      t: 'ul',
      items: [
        'Přihlášku k registraci podáš do **15 dnů** po skončení měsíce, ve kterém jsi limit překročil',
        'Plátcem se stáváš od **prvního dne druhého měsíce** po měsíci, ve kterém k překročení došlo',
        'Příklad: limit překročíš v září, přihlášku podáš do 15. října a plátcem jsi od 1. listopadu',
      ],
    },
    { t: 'h2', text: 'Dobrovolná registrace' },
    {
      t: 'p',
      text: 'Plátcem se můžeš stát i dřív, dobrovolně. Dává to smysl, když fakturuješ hlavně firmám, které jsou samy plátci, nebo když pořizuješ drahé vybavení a chceš z něj odečíst DPH. Počítej ale s tím, že přibude přiznání k DPH a kontrolní hlášení.',
    },
    { t: 'h2', text: 'Co se změní na fakturách' },
    {
      t: 'ul',
      items: [
        'Přibude tvoje DIČ',
        'Na faktuře musí být datum uskutečnění zdanitelného plnění',
        'DPH se rozepisuje po sazbách, dnes 21 % a 12 %',
        'Musíš vést evidenci DPH a odvádět daň',
      ],
    },
    {
      t: 'p',
      text: 'Kompletní seznam povinných údajů najdeš v článku [Náležitosti faktury](/blog/nalezitosti-faktury).',
    },
    { t: 'h2', text: 'Identifikovaná osoba' },
    {
      t: 'p',
      text: 'Pokud nejsi plátce, ale kupuješ služby nebo zboží z jiné země EU, například reklamu nebo software, můžeš se stát takzvanou identifikovanou osobou. Není to totéž co plátce, řeší se tím jen DPH u těchto zahraničních nákupů. Podrobnosti ověř u finančního úřadu.',
    },
    {
      t: 'tip',
      title: 'Limit si pohlídáš v přehledu',
      text: 'V přehledu Fakturu vidíš příjmy za posledních 12 měsíců, takže víš, jak blízko limitu jsi. Když už jsi plátce, [Fakturo počítá DPH po sazbách](/funkce) a rozepíše ho na faktuře.',
    },
  ],
}
