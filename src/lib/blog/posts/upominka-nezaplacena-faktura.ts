import type { Post } from '../types'

export const upominkaNezaplacenaFaktura: Post = {
  slug: 'upominka-nezaplacena-faktura',
  title: 'Jak napsat upomínku za nezaplacenou fakturu',
  description:
    'Kdy poslat první upomínku, co v ní má být, vzor textu a co dělat, když klient dál nereaguje. Včetně úroku z prodlení.',
  category: 'Platby a upomínky',
  published: '2026-09-21',
  related: ['nalezitosti-faktury', 'qr-platba-na-fakture', 'pravidelna-fakturace'],
  blocks: [
    {
      t: 'p',
      text: 'Většina opožděných plateb není zlý úmysl, klient na fakturu prostě zapomněl. Proto začni věcně a klidně. Tvrdší tón si nech na později, kdyby první zprávy nezabraly.',
    },
    { t: 'h2', text: 'Kdy poslat první upomínku' },
    {
      t: 'p',
      text: 'Několik dní po splatnosti, ideálně po třech až sedmi. Dřív působíš netrpělivě, později se ti špatně vysvětluje, proč jsi nereagoval hned. Před odesláním ještě zkontroluj účet, jestli platba nepřišla pod jiným variabilním symbolem.',
    },
    { t: 'h2', text: 'Co má upomínka obsahovat' },
    {
      t: 'ul',
      items: [
        'Číslo faktury a dlužnou částku',
        'Původní datum splatnosti',
        'Nový termín, například sedm dní od odeslání',
        'Číslo účtu a variabilní symbol',
        'Kopii faktury v příloze',
        'Tvůj kontakt pro případ, že je s fakturou nějaký problém',
      ],
    },
    { t: 'h2', text: 'Vzor první upomínky' },
    {
      t: 'quote',
      text: 'Dobrý den, dovolujeme si vás upozornit, že faktura č. 20260012 na částku 15 730 Kč měla splatnost 14. 9. 2026 a zatím jsme neevidovali její úhradu. Prosíme o zaplacení do sedmi dnů. Pokud jste již platili, berte tuto zprávu jako bezpředmětnou. Děkujeme.',
    },
    { t: 'h2', text: 'Úrok z prodlení' },
    {
      t: 'p',
      text: 'Mezi podnikateli ti od prvního dne po splatnosti vzniká nárok na úrok z prodlení. Jeho výše je **repo sazba České národní banky platná k prvnímu dni pololetí plus osm procentních bodů ročně**. Můžeš požadovat i paušální náhradu nákladů spojených s vymáháním pohledávky. Jestli ji uplatnit, je na tobě, mnoho lidí to u dobrých klientů nedělá.',
    },
    { t: 'h2', text: 'Když klient dál nereaguje' },
    {
      t: 'ol',
      items: [
        'Pošli druhou upomínku s pevným termínem a upozorněním na úrok z prodlení',
        'Zavolej. Osobní kontakt často vyřeší to, co e-maily neřešily',
        'Pošli předžalobní výzvu, ve které oznámíš, že věc předáš k vymáhání',
        'Podej návrh na vydání platebního rozkazu u soudu',
      ],
    },
    {
      t: 'p',
      text: 'Pohledávka se běžně promlčuje za tři roky od splatnosti, takže s vymáháním neotálej příliš dlouho.',
    },
    { t: 'h2', text: 'Jak si upomínky ulehčit' },
    {
      t: 'p',
      text: 'Nejlepší upomínka je ta, kterou nemusíš psát. Snižuje se i počet faktur, které se vůbec dostanou po splatnosti, když je na nich [QR platba](/blog/qr-platba-na-fakture) a správný variabilní symbol.',
    },
    {
      t: 'tip',
      title: 'Upomínky za tebe',
      text: 'V plánu Pro Fakturo posílá upomínky samo, ve výchozím nastavení tři, sedm a čtrnáct dní po splatnosti. Platby z výpisu z banky se navíc [párují s fakturami](/funkce), takže zaplacené faktury upomínku nedostanou.',
    },
  ],
}
