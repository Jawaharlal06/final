//import puppeteer from 'puppeteer';

/**
 * Extracts heading + paragraph pairs for reel creation from a dynamic webpage.
 * @param {string} url
 * @returns {Promise<Array<{ heading: string, paragraph: string }>>}
 */
/*export async function scrapeWebpage(url) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setViewport({ width: 1200, height: 800 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

  // Trigger lazy-loading by scrolling
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let total = 0;
      const distance = 500;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        total += distance;
        if (total >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 250);
    });
  });

  // Extract all visible text blocks
  const rawBlocks = await page.evaluate(() => {
    const blocks = [];
    const seen = new Set();
    const elements = document.querySelectorAll('h1, h2, h3, p, div');

    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const visible = style.display !== 'none' &&
                      style.visibility !== 'hidden' &&
                      el.offsetHeight > 0;

      if (!visible) return;

      const text = el.innerText?.trim();
      if (!text || text.length < 30 || seen.has(text)) return;

      seen.add(text);
      blocks.push(text);
    });

    return blocks;
  });

  await browser.close();

  // Structure as heading + paragraph pairs
  const result = [];
  for (let i = 0; i < rawBlocks.length - 1; i++) {
    const heading = rawBlocks[i];
    const paragraph = rawBlocks[i + 1];

    if (
      heading.length < 120 &&
      paragraph.length > 80 &&
      /^[A-Z0-9]/.test(heading)
    ) {
      result.push({ heading, paragraph });
      i++; // skip used paragraph
    }
  }

  return result;
}*/

/*import { chromium } from 'playwright';
import { JSDOM } from 'jsdom';
import { URL } from 'url';

/**
 * Extracts visible text and image URLs from a webpage.
 * @param {string} targetUrl - The full URL of the webpage to scrape.
 * @returns {Promise<{ url: string, text?: string, images?: string[], error?: string }>}
 */
/*export async function scrapeWebpage(targetUrl) {
  try {
    const browser = await chromium.launch({ headless: true });

    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    });

    const page = await context.newPage();

    await page.goto(targetUrl, { timeout: 60000 });
    await page.waitForSelector("body", { timeout: 15000 }); // Ensure basic content is loaded

    const html = await page.content();
    await browser.close();

    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove unwanted tags
    ['script', 'style', 'noscript', 'svg', 'iframe'].forEach(tag => {
      document.querySelectorAll(tag).forEach(el => el.remove());
    });

    // Extract visible text
    const text = document.body.textContent.replace(/\s+/g, ' ').trim();

    // Extract image URLs
    const base = new URL(targetUrl);
    const images = [...document.querySelectorAll('img[src]')]
      .map(img => img.getAttribute('src'))
      .filter(src => /\.(jpg|jpeg|png|webp|gif)$/i.test(src || ''))
      .map(src => new URL(src, base).href);

    return {
      url: targetUrl,
      text,
      images
    };
  } catch (error) {
    return {
      url: targetUrl,
      error: error.message
    };
  }
}*/
/*import { chromium } from 'playwright';
import { JSDOM } from 'jsdom';
import { URL } from 'url';

/**
 * Scrapes a webpage and returns an ordered list of content blocks (headings, paragraphs, images).
 * @param {string} targetUrl - The URL of the webpage to scrape.
 * @returns {Promise<{ url: string, content?: object[], error?: string }>}
 */
/*export async function scrapeWebpage(targetUrl) {
  try {
    const browser = await chromium.launch({ headless: true });

    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    });

    const page = await context.newPage();
    await page.goto(targetUrl, { timeout: 60000 });
    await page.waitForSelector("body", { timeout: 15000 });

    const html = await page.content();
    await browser.close();

    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Clean unwanted tags
    ['script', 'style', 'noscript', 'iframe', 'svg'].forEach(tag => {
      document.querySelectorAll(tag).forEach(el => el.remove());
    });

    const base = new URL(targetUrl);
    const content = [];

    // Loop through all DOM elements in order
    const elements = document.body.querySelectorAll('*');
    for (const el of elements) {
      const tag = el.tagName.toLowerCase();

      if (tag.match(/^h[1-6]$/)) {
        content.push({
          type: 'heading',
          level: tag,
          text: el.textContent.trim()
        });
      } else if (tag === 'p') {
        const text = el.textContent.trim();
        if (text) {
          content.push({
            type: 'paragraph',
            text
          });
        }
      } else if (tag === 'img' && el.getAttribute('src')) {
        const src = el.getAttribute('src').trim();
        if (/\.(jpg|jpeg|png|webp|gif)$/i.test(src)) {
          content.push({
            type: 'image',
            src: new URL(src, base).href,
            alt: el.getAttribute('alt') || ''
          });
        }
      }
    }

    return { url: targetUrl, content };

  } catch (error) {
    return {
      url: targetUrl,
      error: error.message
    };
  }
}*/

/*import { chromium } from 'playwright';
import { JSDOM } from 'jsdom';
import { URL } from 'url';

/**
 * Scrapes a webpage and returns an ordered list of content blocks (headings, paragraphs, images).
 * @param {string} targetUrl - The URL of the webpage to scrape.
 * @returns {Promise<{ url: string, content?: object[], error?: string }>}
 */
/*export async function scrapeWebpage(targetUrl) {
  try {
    const browser = await chromium.launch({ headless: true });

    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36",
      locale: "en-US",
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();

    // Go to URL
    await page.goto(targetUrl, { timeout: 60000 });

    // Wait specifically for the main content to appear
    await page.waitForSelector('main', { timeout: 15000 });

    // Get the full page content after JS rendering
    const html = await page.content();
    await browser.close();

    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove irrelevant tags
    ['script', 'style', 'noscript', 'iframe', 'svg'].forEach(tag => {
      document.querySelectorAll(tag).forEach(el => el.remove());
    });

    const base = new URL(targetUrl);
    const content = [];

    // Traverse DOM in order
    const elements = document.querySelectorAll('main *'); // only inside <main>

    for (const el of elements) {
      const tag = el.tagName.toLowerCase();

      if (tag.match(/^h[1-6]$/)) {
        content.push({
          type: 'heading',
          level: tag,
          text: el.textContent.trim()
        });
      } else if (tag === 'p') {
        const text = el.textContent.trim();
        if (text) {
          content.push({
            type: 'paragraph',
            text
          });
        }
      } else if (tag === 'img' && el.getAttribute('src')) {
        const src = el.getAttribute('src').trim();
        if (/\.(jpg|jpeg|png|webp|gif)$/i.test(src)) {
          content.push({
            type: 'image',
            src: new URL(src, base).href,
            alt: el.getAttribute('alt') || ''
          });
        }
      }
    }

    return { url: targetUrl, content };

  } catch (error) {
    return {
      url: targetUrl,
      error: error.message
    };
  }
}
*/

/*import { chromium } from 'playwright';
import { JSDOM } from 'jsdom';

/**
 * Extracts structured content from a webpage in visual order as a list of blocks.
 * @param {string} targetUrl
 * @returns {Promise<{ url: string, content?: object[], error?: string }>}
 */
/*export async function scrapeWebpage(targetUrl) {
  try {
    const browser = await chromium.launch({ headless: true });

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36',
    });

    const page = await context.newPage();
    await page.goto(targetUrl, { timeout: 60000 });
    await page.waitForSelector('article', { timeout: 15000 });

    const html = await page.content();
    await browser.close();

    const dom = new JSDOM(html);
    const document = dom.window.document;
    const article = document.querySelector('article');

    if (!article) {
      return { url: targetUrl, error: 'Article content not found' };
    }

    // Clean unwanted tags
    ['script', 'style', 'svg', 'noscript', 'iframe'].forEach((tag) =>
      article.querySelectorAll(tag).forEach((el) => el.remove())
    );

    const blocks = [];

    for (const el of article.querySelectorAll('*')) {
      const tag = el.tagName.toLowerCase();
      const text = el.textContent.trim();

      if (!text) continue;

      // Headings
      if (tag.match(/^h[1-6]$/)) {
        blocks.push({
          type: 'heading',
          level: tag,
          text,
        });
      }

      // Paragraphs
      else if (tag === 'p') {
        blocks.push({
          type: 'paragraph',
          text,
        });
      }

      // List items
      else if (tag === 'li') {
        blocks.push({
          type: 'list-item',
          text,
        });
      }

      // Code blocks
      else if (tag === 'pre' || tag === 'code') {
        const code = el.textContent.trim();
        if (code) {
          blocks.push({
            type: 'code',
            text: code,
          });
        }
      }

      // Images (optional)
      else if (tag === 'img' && el.src) {
        blocks.push({
          type: 'image',
          src: el.src,
          alt: el.alt || '',
        });
      }
    }

    return { url: targetUrl, content: blocks };
  } catch (error) {
    return { url: targetUrl, error: error.message };
  }
}*/


// scrape.js (ESM format)
import { chromium } from 'playwright';
import { JSDOM } from 'jsdom';
import fs from 'fs'; // Don't forget to import fs if saving

export async function scrapeWebpage(url) {
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36',
  });

  const page = await context.newPage();
  await page.goto(url, { timeout: 60000 });
  await page.waitForSelector('article', { timeout: 15000 });

  const html = await page.content();
  await browser.close();

  const dom = new JSDOM(html);
  const document = dom.window.document;

  const elements = [...document.body.querySelectorAll('h1, h2, h3, h4, h5, h6, p')];

let blocks = [];

for (const el of elements) {
  const tag = el.tagName.toLowerCase();
  let text = el.textContent.trim();
  if (!text) continue;

  if (tag.match(/^h[1-6]$/)) {
    text = text.toUpperCase(); // Make heading uppercase
    blocks.push({ level: tag, text });
  } else if (tag === "p") {
    blocks.push({ text });
  }
}

return blocks;
}







