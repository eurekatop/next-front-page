import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface Frontmatter {
  title: string
  date: string
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

export function getPostSlugs(locale: string) {
  const dir = path.join(process.cwd(), 'posts', locale)
  return fs.existsSync(dir) ? fs.readdirSync(dir) : []
}

export function getPostBySlug(slug: string, locale: string) {
  const realSlug = slug.replace(/\.mdx$/, '')
  let fullPath = path.join(process.cwd(), 'posts', locale, `${realSlug}.mdx`)

  if (!fs.existsSync(fullPath)) {
    for (const fallbackLocale of fallbackLocales[locale] || []) {
      const fallbackPath = path.join(process.cwd(), 'posts', fallbackLocale, `${realSlug}.mdx`)
      if (fs.existsSync(fallbackPath)) {
        fullPath = fallbackPath
        break
      }
    }
  }

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found for slug "${slug}" in locale "${locale}" or fallbacks.`)
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug: realSlug,
    frontmatter: data as Frontmatter,
    content
  }
}
