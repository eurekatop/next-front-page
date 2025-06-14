import fs from 'fs'
import path from 'path'



export interface FeaturedItem {
  title: string;
  description: string;
  href: string;
  image: string;
  emoji?: string;
}

const fallbackLocales: Record<string, string[]> = {
  ca: ['en', 'es'],
  es: ['en', 'ca'],
  en: ['es', 'ca']
};

const BASE_DIR = process.env.BASE_CONTENT_DIR
  ? path.resolve(process.cwd(), process.env.BASE_CONTENT_DIR)
  : path.join(process.cwd(), '');

/**
 * Return all the featured items in a given language.
 */
export function getFeaturedItems(locale: string): FeaturedItem[] {
  if (!BASE_DIR) throw new Error('BASE_CONTENT_DIR is not set');
  if (!locale) throw new Error('Locale is not set');

  const dir = path.join(BASE_DIR, 'featured', locale);
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const filePath = path.join(dir, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      try {
        return JSON.parse(raw) as FeaturedItem;
      } catch (e) {
        console.warn(`Could not parse featured file: ${filePath}`);
        return null;
      }
    })
    .filter(Boolean) as FeaturedItem[];
}

/**
 * Find a featured item by its `href` property. It will first look at the current locale,
 * and then it will use fallback languages until one match is found. If no match is found,
 * returns null.
 */
export function getFeaturedByHref(href: string, locale: string): FeaturedItem | null {
  const localesToTry = [locale, ...(fallbackLocales[locale] || [])];

  for (const lang of localesToTry) {
    const dir = path.join(BASE_DIR, 'featured', lang);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const fullPath = path.join(dir, file);
      try {
        const raw = fs.readFileSync(fullPath, 'utf8');
        const item = JSON.parse(raw) as FeaturedItem;
        if (item.href === href) {
          return item;
        }
      } catch (e) {
        console.warn(`Error reading or parsing ${fullPath}`);
      }
    }
  }

  return null;
}
