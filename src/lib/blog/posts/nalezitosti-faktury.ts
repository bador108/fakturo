import type { Post } from '../types'

export const nalezitostiFaktury: Post = {
  slug: 'nalezitosti-faktury',
  title: 'Náležitosti faktury a co na ní musí být',
  description:
    'Co musí obsahovat faktura od neplátce a od plátce DPH. Povinné údaje, rozdíly mezi nimi a nejčastější chyby, kvůli kterým se faktura vrací.',
  category: 'Základy fakturace',
  published: '2026-09-21',
  related: ['faktura-neplatce-dph', 'kdy-se-stat-platcem-dph', 'qr-platba-na-fakture'],
  blocks: [
    {
      t: 'p',
      text: 'Faktura je doklad, podle kterého ti klient platí a podle kterého si ty i on vedete účetnictví. Když na ní chybí povinný údaj, klient ji může vrátit a platba se zdrží. Plátce DPH si navíc bez správného dokladu nemusí odečíst daň.',
    },
    { t: 'h2', text: 'Co musí být na každé faktuře' },
    {
      t: 'ul',
      items: [
        '**Dodavatel** – jméno nebo obchodní firma, adresa sídla nebo místa podnikání a IČO',
        '**Odběratel** – stejné údaje o tom, komu fakturuješ',
        '**Číslo faktury** – jedinečné a nejlépe průběžné, například 20260012 (rok a pořadí)',
        '**Datum vystavení**',
        '**Datum splatnosti**',
        '**Předmět plnění** – co přesně fakturuješ, tedy popis práce nebo zboží',
        '**Částka k úhradě**',
        '**Způsob platby** – číslo účtu a variabilní symbol',
      ],
    },
    {
      t: 'p',
      text: 'Pro neplátce DPH zákon nestanoví pevný vzor. Tyto údaje jsou ale to, co se na fakturách běžně uvádí a co od nich čeká odběratel i účetní.',
    },
    { t: 'h2', text: 'Co navíc musí mít plátce DPH' },
    { t: 'p', text: 'Faktura plátce DPH je zároveň daňový doklad, takže musí obsahovat víc:' },
    {
      t: 'ul',
      items: [
        '**DIČ** dodavatele a také odběratele, pokud je plátcem',
        '**Datum uskutečnění zdanitelného plnění** (DUZP), tedy den, kdy jsi službu dodal nebo zboží předal',
        '**Množství a jednotková cena** bez DPH',
        '**Základ daně** zvlášť pro každou sazbu DPH',
        '**Sazba DPH** a její výše v korunách',
        '**Celková částka k úhradě**',
      ],
    },
    {
      t: 'p',
      text: 'V Česku jsou od roku 2024 dvě sazby DPH: základní **21 %** a snížená **12 %**. Faktura s více položkami může mít obě, DPH se pak rozepisuje zvlášť pro každou sazbu.',
    },
    { t: 'h2', text: 'Jak poznáš, jestli je dodavatel plátce' },
    {
      t: 'p',
      text: 'Stav plátce DPH je veřejný. Zkontroluješ ho v registru plátců DPH na webu Finanční správy. Je to důležité hlavně tehdy, když si chceš z faktury odečíst DPH. Pokud dodavatel plátcem není, finanční úřad by ti odpočet mohl nepovolit.',
    },
    { t: 'h2', text: 'Nejčastější chyby' },
    {
      t: 'ul',
      items: [
        'U plátce DPH chybí datum uskutečnění zdanitelného plnění',
        'Špatné IČO nebo neaktuální adresa odběratele',
        'Dvě faktury se stejným číslem',
        'Chybí variabilní symbol, takže se platba nespáruje s fakturou',
        'DPH je spočtené z celkové částky místo po jednotlivých sazbách',
      ],
    },
    {
      t: 'tip',
      title: 'Ve Fakturu to hlídá formulář',
      text: 'IČO se doplní z registru ARES, DPH se počítá po sazbách zvlášť u každé položky a číslo faktury se řadí průběžně. Můžeš to vyzkoušet v [bezplatném generátoru faktur](/generator) bez registrace.',
    },
  ],
}
