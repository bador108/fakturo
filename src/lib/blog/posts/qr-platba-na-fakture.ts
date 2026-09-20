import type { Post } from '../types'

export const qrPlatba: Post = {
  slug: 'qr-platba-na-fakture',
  title: 'QR platba na faktuře',
  description:
    'Jak funguje QR platba, co v kódu je, proč se vyplatí dát ji na každou fakturu a na co si dát pozor, aby platba dorazila správně.',
  category: 'Platby a upomínky',
  published: '2026-09-21',
  related: ['upominka-nezaplacena-faktura', 'nalezitosti-faktury', 'pravidelna-fakturace'],
  blocks: [
    {
      t: 'p',
      text: 'QR kód na faktuře zná každý, kdo někdy platil přes mobilní bankovnictví. Naskenuješ ho, banka předvyplní příkaz a ty jen potvrdíš. Pro toho, kdo fakturuje, je to jeden z nejlevnějších způsobů, jak dostat zaplaceno rychleji.',
    },
    { t: 'h2', text: 'Jak QR platba funguje' },
    {
      t: 'p',
      text: 'V kódu je zapsané číslo účtu, částka, měna, variabilní symbol a případně zpráva pro příjemce. Formát vydala Česká bankovní asociace a umí ho načíst aplikace všech českých bank. Klient nic nepřepisuje, takže nemůže udělat překlep.',
    },
    { t: 'h2', text: 'Proč ji dát na každou fakturu' },
    {
      t: 'ul',
      items: [
        '**Rychlejší platba**, protože stačí otevřít bankovnictví a naskenovat kód',
        '**Méně překlepů** v čísle účtu i v částce',
        '**Správný variabilní symbol**, díky kterému platbu snadno spárujete s fakturou',
        '**Méně dotazů**, protože klient hned vidí, kam a kolik poslat',
      ],
    },
    { t: 'h2', text: 'Na co si dát pozor' },
    {
      t: 'ul',
      items: [
        'Číslo účtu musí být správně, kód zapisuje ve tvaru IBAN',
        'Částka v kódu musí odpovídat částce k úhradě na faktuře',
        'Variabilní symbol by měl být jedinečný pro každou fakturu, obvykle číslo faktury',
        'Měna kódu se musí shodovat s měnou faktury',
      ],
    },
    { t: 'h2', text: 'Proč záleží na variabilním symbolu' },
    {
      t: 'p',
      text: 'Bez něj se platba u tebe objeví jen jako částka od neznámého odesílatele. Když má každá faktura svůj symbol, poznáš z výpisu hned, kdo zaplatil co. Souvisí to i s upomínkami. Pokud platby správně přiřadíš, nemusíš zbytečně upomínat ty, kdo už zaplatili, jak popisuje článek [Jak napsat upomínku za nezaplacenou fakturu](/blog/upominka-nezaplacena-faktura).',
    },
    {
      t: 'tip',
      title: 'QR platba ve Fakturu',
      text: 'Když máš ve Fakturu vyplněný bankovní účet, doklad obsahuje QR platbu s částkou a variabilním symbolem. Žádný kód nekreslíš ručně, stačí [vystavit fakturu](/generator).',
    },
  ],
}
