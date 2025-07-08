import { chromium } from 'playwright';
import { JSDOM } from 'jsdom';
import { decode } from 'querystring';
import { URL } from 'url';

export async function scrapeWebpage(url) {
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36',
  });

  const page = await context.newPage();
  await page.goto(url, { timeout: 60000 });

  try {
    await page.waitForSelector('article, body', { timeout: 15000 });
  } catch (err) {
    console.warn('No article/body selector found, continuing anyway...');
  }

  const html = await page.content();
  await browser.close();

  const dom = new JSDOM(html);
  const document = dom.window.document;

  const elements = [
    ...document.body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, img'),
  ];

  let blocks = [];

  for (const el of elements) {
    const tag = el.tagName.toLowerCase();

    if (tag.match(/^h[1-6]$/)) {
      const text = el.textContent.trim();
      if (text) {
        blocks.push({ type: 'heading', level: tag, text: text.toUpperCase() });
      }
    } else if (tag === 'p') {
      const text = el.textContent.trim();
      if (text) {
        blocks.push({ type: 'paragraph', text });
      }
    } else if (tag === 'img') {
      let src = el.getAttribute('src') || '';
      const alt = el.getAttribute('alt') || '';

      // Handle Next.js image proxies
      if (src.startsWith('/_next/image')) {
        try {
          const fullUrl = new URL(src, url);
          const query = decode(fullUrl.search.slice(1));
          if (query.url) {
            src = query.url;
          }
        } catch (err) {
          console.warn('Failed to decode Next.js image URL:', err);
        }
      }

      // Convert relative to absolute URL
      if (src && !src.startsWith('http')) {
        try {
          src = new URL(src, url).href;
        } catch (err) {
          console.warn('Failed to resolve image URL:', err);
          continue;
        }
      }

      if (src) {
        blocks.push({ type: 'image', src, alt });
      }
    }
  }

  return blocks;
}
