import puppeteer from 'puppeteer'
import { extractRelevantContent } from './filterOpenAI'

// Utility to split long text
function splitText(text: string, maxLen: number): string[] {
  const words = text.split(' ')
  const chunks = []
  for (let i = 0; i < words.length; i += maxLen) {
    chunks.push(words.slice(i, i + maxLen).join(' '))
  }
  return chunks
}

export async function scrapeWebsiteText(baseUrl: string): Promise<string[]> {
  const browser = await puppeteer.launch({ headless: true })

  const commonPaths = ['/', '/about', '/services', '/contact', '/products']
  const allTexts: string[] = []

  for (const path of commonPaths) {
    const fullUrl = new URL(path, baseUrl).href
    try {
      const page = await browser.newPage()
      await page.goto(fullUrl, { waitUntil: 'domcontentloaded' })

      // Try opening dropdowns/accordions
      await page.evaluate(() => {
        document.querySelectorAll('details, summary, button, .accordion, .dropdown').forEach((el) => {
          try {
            (el as HTMLElement).click()
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_) {}
        })
      })

      await new Promise(res => setTimeout(res, 800))

      const text = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('p, h1, h2, h3, li, span'))
          .map((el) => el.textContent?.trim())
          .filter(Boolean)
          .join('\n')
      })

      allTexts.push(text)
      await page.close()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      console.warn(`❌ Failed to scrape: ${fullUrl}`)
    }
  }

  await browser.close()

  const combined = allTexts.join('\n\n')
  const filtered = await extractRelevantContent(combined)

  return splitText(filtered, 800)
}
