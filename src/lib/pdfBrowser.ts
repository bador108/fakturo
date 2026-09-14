import type { Browser } from 'puppeteer-core'

// Lokálně (npm run dev) použijeme nainstalovaný Chrome, na Vercelu serverless
// @sparticuz/chromium (staticky sbalený Chromium, co se vejde do limitu funkce).
export async function launchBrowser(): Promise<Browser> {
  const puppeteer = await import('puppeteer-core')

  if (process.env.NODE_ENV !== 'production' || process.env.CHROME_EXECUTABLE_PATH) {
    const executablePath =
      process.env.CHROME_EXECUTABLE_PATH ??
      'C:/Program Files/Google/Chrome/Application/chrome.exe'
    return puppeteer.launch({ executablePath, headless: true })
  }

  const chromium = (await import('@sparticuz/chromium')).default
  return puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  })
}

// Vyrenderuje HTML do PDF bufferu. Čeká na document.fonts.ready — bez toho Chrome
// umí PDF vygenerovat DŘÍV, než se stihne vlastní @font-face font natáhnout,
// a vykreslí české znaky náhradními "tofu" čtverečky (□).
export async function renderPdfFromHtml(html: string): Promise<Uint8Array> {
  const browser = await launchBrowser()
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.evaluateHandle('document.fonts.ready')
    return await page.pdf({ format: 'A4', printBackground: true })
  } finally {
    await browser.close()
  }
}
