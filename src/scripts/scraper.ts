import puppeteer from 'puppeteer'

export async function scrapeWebsiteText(url: string): Promise<string[]> {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle2' })

  const textContent = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('p, h1, h2, li'))
      .map(el => el.textContent?.trim())
      .filter(Boolean) as string[]
  })

  await browser.close()
  return textContent
}
