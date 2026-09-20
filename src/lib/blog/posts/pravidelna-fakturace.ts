import type { Post } from '../types'

export const pravidelnaFakturace: Post = {
  slug: 'pravidelna-fakturace',
  title: 'Pravidelná fakturace a jak ji zautomatizovat',
  description:
    'Kdy se vyplatí opakované faktury, na co si dát pozor a jak nastavit pravidelnou fakturaci krok za krokem, aby se odesílala sama.',
  category: 'Automatizace',
  published: '2026-09-21',
  related: ['upominka-nezaplacena-faktura', 'qr-platba-na-fakture', 'nalezitosti-faktury'],
  blocks: [
    {
      t: 'p',
      text: 'Pokud každý měsíc vystavuješ stejné faktury stejným klientům, děláš práci, kterou má za tebe dělat počítač. Pravidelná fakturace je nejjednodušší způsob, jak si uvolnit ruce a nezapomenout.',
    },
    { t: 'h2', text: 'Kdy se pravidelná fakturace hodí' },
    {
      t: 'ul',
      items: [
        'Správa webu nebo sociálních sítí za měsíční paušál',
        'Pronájem prostoru nebo vybavení',
        'Předplatné a licence pro klienty',
        'Dlouhodobé zakázky se stejnou částkou každý měsíc',
        'Účetnictví, mzdy a další služby s pevnou cenou',
      ],
    },
    { t: 'h2', text: 'Na co si dát pozor' },
    {
      t: 'ul',
      items: [
        'Když se částka mění, faktura se sama nezmění. Změnu musíš do šablony zapsat',
        'Plátce DPH musí mít správné datum uskutečnění zdanitelného plnění, viz [náležitosti faktury](/blog/nalezitosti-faktury)',
        'Každá faktura potřebuje vlastní číslo a variabilní symbol',
        'Smlouva s klientem by měla pravidelnou fakturaci a její termíny zmiňovat',
      ],
    },
    { t: 'h2', text: 'Postup krok za krokem' },
    {
      t: 'ol',
      items: [
        'Přidej klienta a ověř jeho údaje, ideálně přes registr ARES',
        'Vytvoř šablonu faktury s položkami, cenou a DPH',
        'Zvol frekvenci: měsíčně, čtvrtletně nebo ročně',
        'Nastav den vystavení a datum první faktury',
        'Zkontroluj první vystavenou fakturu a klientovi ji potvrď',
        'Sleduj platby. Pokud klient nezaplatí, pomůže [upomínka](/blog/upominka-nezaplacena-faktura)',
      ],
    },
    {
      t: 'p',
      text: 'Nepravidelné doplatky, jako je hodinový nadstandard nad paušál, fakturuj zvlášť. Nemíchej je do pravidelné šablony, jinak přestane být přehledná.',
    },
    { t: 'h2', text: 'Kolik faktur si tím ušetříš' },
    {
      t: 'p',
      text: 'Pokud máš třeba pět klientů s měsíčním paušálem, je to šedesát faktur za rok. Při pěti minutách na jednu to dělá pět hodin práce, které můžeš strávit něčím užitečnějším. Důležitější je ale to, že žádná fakturace nezapadne.',
    },
    {
      t: 'tip',
      title: 'Pravidelné faktury ve Fakturu',
      text: 'V plánu Pro nastavíš šablonu jednou a Fakturo faktury podle plánu vystaví a pošle klientovi e-mailem. Vše je popsané na stránce [Pravidelná fakturace](/pravidelne-fakturace).',
    },
  ],
}
