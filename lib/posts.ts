import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface Frontmatter {
  title: string
  date: string
  summary: string
  slug: string
  image?: string
  imageAlt?: string
  categories?: string[]
  tags?: string[]
  author?: string
  featured?: boolean
}

const fallbackLocales = {
  ca: ['en', 'es'],
  es: ['en', 'ca'],
  en: ['es', 'ca']
}


const BASE_DIR = process.env.BASE_CONTENT_DIR
  ? path.resolve(process.cwd(), process.env.BASE_CONTENT_DIR)
  : path.join(process.cwd(), '')



export function getPostSlugs(locale: string): string[] {
  console.log ('BASE_DIR', BASE_DIR);
  if (!BASE_DIR) {
    throw new Error('BASE_CONTENT_DIR is not set')
  }

  if (!locale) {
    throw new Error('Locale is not set')
  }
  const dir = path.join(BASE_DIR, 'posts', locale)
  if (!fs.existsSync(dir)) return []

  return fs.readdirSync(dir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const fullPath = path.join(dir, file)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      return data.slug
    })
    .filter(Boolean) // només si hi ha slug
}

export function getPostBySlug(slug: string, locale: string) {
  const dir = path.join(BASE_DIR, 'posts', locale)
  let fullPath: string | null = null

  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))

    for (const file of files) {
      const pathCandidate = path.join(dir, file)
      const fileContents = fs.readFileSync(pathCandidate, 'utf8')
      const { data } = matter(fileContents)
      if (data.slug === slug) {
        fullPath = pathCandidate
        break
      }
    }
  }

  // Buscar en fallbacks si no trobat
  if (!fullPath) {
    for (const fallbackLocale of fallbackLocales[locale] || []) {
      const fallbackDir = path.join(BASE_DIR, 'posts', fallbackLocale)
      if (!fs.existsSync(fallbackDir)) continue
      const files = fs.readdirSync(fallbackDir).filter((f) => f.endsWith('.mdx'))

      for (const file of files) {
        const pathCandidate = path.join(fallbackDir, file)
        const fileContents = fs.readFileSync(pathCandidate, 'utf8')
        const { data } = matter(fileContents)
        if (data.slug === slug) {
          fullPath = pathCandidate
          break
        }
      }

      if (fullPath) break
    }
  }

  if (!fullPath) {
    throw new Error(`Post not found for slug "${slug}" in locale "${locale}" or fallbacks.`)
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug: data.slug,
    frontmatter: data as Frontmatter,
    content
  }
}
