import type { Post } from '../types'

export const fakturaNeplatceDph: Post = {
  slug: 'faktura-neplatce-dph',
  title: 'Faktura pro neplátce DPH a jak na ni',
  description:
    'Jak vypadá faktura, když nejsi plátce DPH. Co na ni napsat, co na ní být nesmí a ukázka vyplněné faktury krok za krokem.',
  category: 'Základy fakturace',
  published: '2026-09-21',
  related: ['nalezitosti-faktury', 'kdy-se-stat-platcem-dph', 'zalohova-faktura-nebo-danovy-doklad'],
  blocks: [
    {
      t: 'p',
      text: 'Pokud nejsi plátce DPH, je fakturace jednodušší. Nepočítáš daň, nepíšeš datum zdanitelného plnění a nerozepisuješ sazby. Pořád ale musí být z faktury jasné, kdo komu co fakturuje a kolik má zaplatit.',
    },
    { t: 'h2', text: 'Co na ni napsat' },
    {
      t: 'ul',
      items: [
        'Tvoje jméno a adresa, u OSVČ jméno a příjmení',
        'Tvoje IČO',
        'Údaje odběratele: název nebo jméno, adresa a IČO',
        'Číslo faktury',
        'Datum vystavení a datum splatnosti',
        'Popis toho, co fakturuješ, s množstvím a cenou',
        'Celková částka k úhradě',
        'Číslo účtu a variabilní symbol',
      ],
    },
    { t: 'h2', text: 'Co na ní být nesmí' },
    {
      t: 'p',
      text: 'Neplátce nesmí na dokladu vyčíslit DPH. Kdyby to udělal, může být povinen tu daň odvést státu, i když ji od klienta nikdy nevybral. Na faktuře neplátce proto nehledej žádný řádek s DPH.',
    },
    { t: 'h2', text: 'Poznámku o neplátci napsat můžeš' },
    {
      t: 'p',
      text: 'Zákon větu „Nejsem plátce DPH“ nevyžaduje, ale odběrateli ušetří dotaz. Stačí krátká poznámka pod částkou.',
    },
    { t: 'h2', text: 'Ukázka vyplněné faktury' },
    {
      t: 'ul',
      items: [
        'Dodavatel: Jan Novák, Dlouhá 5, 110 00 Praha 1, IČO 12345678',
        'Odběratel: Alfa Design s.r.o., Nádražní 45, 602 00 Brno, IČO 87654321',
        'Faktura č. 20260007, vystaveno 15. 9. 2026, splatnost 29. 9. 2026',
        'Tvorba loga, 1 ks, 8 000 Kč',
        'K úhradě 8 000 Kč, účet 123456789/0800, variabilní symbol 20260007',
        'Poznámka: Nejsem plátce DPH',
      ],
    },
    { t: 'h2', text: 'Kdy se z neplátce stane plátce' },
    {
      t: 'p',
      text: 'Když tvoje tržby za posledních dvanáct měsíců přesáhnou zákonný limit, musíš se stát plátcem. Podrobně to popisuje článek [Kdy se OSVČ musí stát plátcem DPH](/blog/kdy-se-stat-platcem-dph). Od té chvíle se mění i podoba tvých faktur, viz [náležitosti faktury](/blog/nalezitosti-faktury).',
    },
    {
      t: 'tip',
      title: 'Plátce i neplátce ve Fakturu',
      text: 'U každé faktury si přepneš, jestli jsi plátce DPH, a doklad se podle toho vystaví. Začít můžeš [zdarma](/sign-up), pět faktur měsíčně je v ceně.',
    },
  ],
}
