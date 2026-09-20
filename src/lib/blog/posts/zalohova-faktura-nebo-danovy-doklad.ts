import type { Post } from '../types'

export const zalohovaFaktura: Post = {
  slug: 'zalohova-faktura-nebo-danovy-doklad',
  title: 'Zálohová faktura nebo daňový doklad',
  description:
    'Rozdíl mezi zálohovou fakturou a daňovým dokladem, co dělat po přijetí zálohy jako plátce DPH a jak vypadá závěrečná faktura.',
  category: 'Základy fakturace',
  published: '2026-09-21',
  related: ['nalezitosti-faktury', 'faktura-neplatce-dph', 'kdy-se-stat-platcem-dph'],
  blocks: [
    {
      t: 'p',
      text: 'Zálohová faktura a daňový doklad se pletou skoro všem. Vypadají podobně, ale mají jiný účel i jiné důsledky pro DPH. Rozdíl je důležitý hlavně pro plátce.',
    },
    { t: 'h2', text: 'Co je zálohová faktura' },
    {
      t: 'p',
      text: 'Zálohová faktura, které se říká také proforma, je výzva k zaplacení zálohy před dodáním. **Není to daňový doklad** a sama o sobě nezakládá povinnost přiznat DPH ani příjem. Klient podle ní zaplatí, ty práci teprve uděláš.',
    },
    { t: 'h2', text: 'Co je daňový doklad' },
    {
      t: 'p',
      text: 'Daňový doklad je doklad podle zákona o DPH. Nejčastěji je to běžná faktura plátce DPH s náležitostmi, které popisuje článek [Náležitosti faktury](/blog/nalezitosti-faktury). Na jeho základě si plátce odpočítává DPH.',
    },
    { t: 'h2', text: 'Co dělat po přijetí zálohy jako plátce DPH' },
    {
      t: 'p',
      text: 'Plátce DPH odvádí daň už z přijaté zálohy, ne až po dodání. Za přijatou platbu proto musí do **15 dnů** vystavit daňový doklad k přijaté platbě. Teprve potom vystavuje závěrečnou fakturu za celé plnění, ve které se záloha odečte.',
    },
    { t: 'h2', text: 'Co dělat jako neplátce' },
    {
      t: 'p',
      text: 'Neplátce to má jednodušší. Po dodání vystaví normální fakturu na celou částku a zaplacenou zálohu na ní odečte. Zálohová faktura tak slouží hlavně jako pokyn k platbě.',
    },
    { t: 'h2', text: 'Příklad' },
    {
      t: 'ol',
      items: [
        'Domluvíš zakázku za 30 000 Kč a vystavíš zálohovou fakturu na 10 000 Kč',
        'Klient zaplatí zálohu',
        'Práci dokončíš a vystavíš fakturu na 30 000 Kč',
        'Na faktuře odečteš zaplacenou zálohu 10 000 Kč, klient doplatí 20 000 Kč',
      ],
    },
    {
      t: 'p',
      text: 'Pokud jsi plátce DPH, přibude mezi druhým a třetím krokem ještě daňový doklad k přijaté platbě.',
    },
    {
      t: 'tip',
      title: 'Typ dokladu ve Fakturu',
      text: 'Ve formuláři vybereš, jestli vystavuješ fakturu, zálohovou fakturu, opravný doklad nebo cenovou nabídku. Funkce jsou přehledně popsané [na stránce Funkce](/funkce).',
    },
  ],
}
