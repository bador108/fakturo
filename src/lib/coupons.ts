import { randomInt } from 'crypto'
import { stripe } from '@/lib/stripe'

// Kupon "1 měsíc zdarma": 100 % sleva na první platbu předplatného Start nebo Pro.
// Kódy (promotion codes) jdou zadat v platební bráně u měsíční platby, každý jen jednou.
export const FREE_MONTH_COUPON_ID = 'MESIC-ZDARMA'

export interface PromoCodeInfo {
  code: string
  used: boolean
  created: string
}

// bez 0/O/1/I/L, ať se kód dá bezpečně přepsat z papíru
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function randomCode(): string {
  return `FAKTURO-${Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')}`
}

async function ensureFreeMonthCoupon(): Promise<void> {
  try {
    await stripe.coupons.retrieve(FREE_MONTH_COUPON_ID)
    return
  } catch {
    // kupon ještě neexistuje → založíme ho
  }
  const monthlyPrices = [process.env.STRIPE_START_MONTHLY_PRICE_ID, process.env.STRIPE_PRO_MONTHLY_PRICE_ID].filter(Boolean) as string[]
  const products = await Promise.all(monthlyPrices.map(async id => {
    const price = await stripe.prices.retrieve(id)
    return typeof price.product === 'string' ? price.product : price.product.id
  }))
  await stripe.coupons.create({
    id: FREE_MONTH_COUPON_ID,
    name: '1 měsíc zdarma',
    percent_off: 100,
    duration: 'once',
    ...(products.length ? { applies_to: { products } } : {}),
  })
}

/** Vygeneruje `count` jednorázových kódů na 1 měsíc zdarma. */
export async function createFreeMonthCodes(count: number): Promise<PromoCodeInfo[]> {
  await ensureFreeMonthCoupon()
  const created: PromoCodeInfo[] = []
  for (let i = 0; i < count; i++) {
    const promo = await stripe.promotionCodes.create({
      promotion: { type: 'coupon', coupon: FREE_MONTH_COUPON_ID },
      code: randomCode(),
      max_redemptions: 1,
    })
    created.push({ code: promo.code, used: false, created: new Date(promo.created * 1000).toISOString() })
  }
  return created
}

/** Všechny kódy na 1 měsíc zdarma (nejnovější první) i s tím, jestli už byly použité. */
export async function listFreeMonthCodes(): Promise<PromoCodeInfo[]> {
  const list = await stripe.promotionCodes.list({ coupon: FREE_MONTH_COUPON_ID, limit: 100 })
  return list.data.map(p => ({
    code: p.code,
    used: p.times_redeemed >= (p.max_redemptions ?? Infinity) || !p.active,
    created: new Date(p.created * 1000).toISOString(),
  }))
}
