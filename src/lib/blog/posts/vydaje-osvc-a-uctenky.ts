import type { Post } from '../types'

export const vydajeOsvc: Post = {
  slug: 'vydaje-osvc-a-uctenky',
  title: 'Výdaje OSVČ a jak si pohlídat účtenky',
  description:
    'Co jsou daňové výdaje OSVČ, rozdíl mezi skutečnými výdaji a výdajovým paušálem a jak uchovat účtenky, aby ti nevyblednul termopapír.',
  category: 'Výdaje',
  published: '2026-09-21',
  related: ['nalezitosti-faktury', 'pravidelna-fakturace', 'kdy-se-stat-platcem-dph'],
  blocks: [
    {
      t: 'p',
      text: 'Výdaje snižují základ, ze kterého platíš daň z příjmů, takže každá zapomenutá účtenka stojí peníze. Zároveň se ale musí dát doložit. Kdo účtenky ztrácí, o výdaje přichází.',
    },
    { t: 'h2', text: 'Skutečné výdaje nebo paušál' },
    {
      t: 'p',
      text: 'OSVČ si může uplatnit skutečné výdaje, které doloží doklady, nebo výdajový paušál. Paušál je procento z příjmů, nejčastěji **80 %, 60 %, 40 % nebo 30 %** podle druhu činnosti. U paušálu žádné účtenky pro daň nepotřebuješ, u skutečných výdajů ano. Kolik ti vyjde lépe, spočítej na svých číslech, nebo se zeptej účetní.',
    },
    { t: 'h2', text: 'Co je daňový výdaj' },
    {
      t: 'p',
      text: 'Výdaj musí být vynaložený na dosažení, zajištění a udržení příjmů z podnikání. Typicky sem patří:',
    },
    {
      t: 'ul',
      items: [
        'Software a předplatná, například nástroje pro práci nebo hosting',
        'Počítač, telefon a další vybavení pro podnikání',
        'Cestovné k zakázkám',
        'Marketing a reklama',
        'Kancelářské potřeby',
      ],
    },
    {
      t: 'p',
      text: 'Soukromé nákupy do výdajů nepatří, i kdyby na nich stálo tvoje IČO. U smíšeného použití, třeba telefonu, si ověř, jak výdaj správně rozdělit.',
    },
    { t: 'h2', text: 'Jak uchovávat doklady' },
    {
      t: 'ul',
      items: [
        '**Foť účtenku hned.** Termopapír na pokladních blocích po čase vybledne a za rok je často prázdný',
        'K výdaji vždy patří doklad. Ukládej ho tam, kde výdaj evidenčně vedeš',
        'Doklady je dobré držet **minimálně pět let**, doklady k DPH deset let',
        'Původní papír vyhoď až po ověření, že fotka je čitelná',
      ],
    },
    { t: 'h2', text: 'Na co si dát pozor' },
    {
      t: 'ul',
      items: [
        'Na dokladu musí být tvoje jméno nebo IČO, jinak ho účetní může odmítnout, zvlášť u větších částek',
        'Zálohu, dobropis a fakturu nezaměňuj a ukládej u sebe, viz [zálohová faktura nebo daňový doklad](/blog/zalohova-faktura-nebo-danovy-doklad)',
        'Cizí měna se přepočítává kurzem, který si vybereš a budeš ho držet',
      ],
    },
    {
      t: 'tip',
      title: 'Foto účtenky ve Fakturu',
      text: 'V evidenci výdajů (plány Start a Pro) přiložíš k výdaji fotku nebo PDF. Text z fotky se přečte přímo v telefonu a předvyplní dodavatele, datum a částku. Fotka se pak uloží k výdaji do soukromého úložiště. Údaje si vždy zkontroluj. Více na stránce [Funkce](/funkce).',
    },
  ],
}
