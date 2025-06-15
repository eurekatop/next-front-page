import fs from 'fs';
import path from 'path';

export interface ExplorationItem {
  title: string;
  description: string;
  url: string;
  icon?: string;
  tags?: string[];
  author?: string;
  created?: string;
  group?: string;
  category?: string; 
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
 * Return all exploration items in a given language, grouped by category and then by group.
 */
export function getGroupedExplorationItems(locale: string): Record<string, Record<string, ExplorationItem[]>> {
  if (!BASE_DIR) throw new Error('BASE_CONTENT_DIR is not set');
  if (!locale) throw new Error('Locale is not set');

  const dir = path.join(BASE_DIR, 'explorations', locale);
  if (!fs.existsSync(dir)) return {};

  const items = fs.readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .flatMap((file) => {
      const filePath = path.join(dir, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        console.warn(`Could not parse exploration file: ${filePath}`);
        return [];
      }
    });

  const grouped: Record<string, Record<string, ExplorationItem[]>> = {};

  for (const item of items) {
    const category = item.category || 'Altres';
    const group = item.group || 'General';

    if (!grouped[category]) grouped[category] = {};
    if (!grouped[category][group]) grouped[category][group] = [];

    grouped[category][group].push(item);
  }

  return grouped;
}

/**
 * Find a single exploration item by its `url` property.
 * Searches in the main locale first, then fallbacks.
 */
export function getExplorationByUrl(url: string, locale: string): ExplorationItem | null {
  const localesToTry = [locale, ...(fallbackLocales[locale] || [])];

  for (const lang of localesToTry) {
    const dir = path.join(BASE_DIR, 'explorations', lang);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const fullPath = path.join(dir, file);
      try {
        const raw = fs.readFileSync(fullPath, 'utf8');
        const parsed = JSON.parse(raw);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        const match = items.find((item) => item.url === url);
        if (match) return match;
      } catch (e) {
        console.warn(`Error reading or parsing ${fullPath}`);
      }
    }
  }

  return null;
}
