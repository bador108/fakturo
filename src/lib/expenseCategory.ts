const CATEGORY_KEYWORDS: { category: string; keywords: RegExp }[] = [
  { category: 'software', keywords: /\b(adobe|figma|notion|github|vercel|openai|anthropic|claude|chatgpt|licence|předplatné|predplatne|subscription|saas|hosting|domain|doména)\b/i },
  { category: 'kancelar', keywords: /\b(papír|papir|tiskárna|tiskarna|kancelářské|kancelarske|toner|šanon|sanon)\b/i },
  { category: 'cestovne', keywords: /\b(letenka|jízdenka|jizdenka|vlak|autobus|benzín|benzin|benzina|nafta|taxi|uber|bolt|parkování|parkovani|dálniční|dalnicni|orlen|shell|omv|čerpací|cerpaci)\b/i },
  { category: 'hardware', keywords: /\b(notebook|laptop|monitor|klávesnice|klavesnice|myš|mys|počítač|pocitac|telefon|mobil|tiskárna|tiskarna|alza|datart|czc)\b/i },
  { category: 'marketing', keywords: /\b(reklama|marketing|ads|facebook|instagram|google ads|inzerce|billboard)\b/i },
]

export function guessCategory(text: string): string {
  const lower = text.toLowerCase()
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.test(lower)) return category
  }
  return 'ostatni'
}
