import type { NextApiRequest, NextApiResponse } from 'next'
import {
  assertAdminLocale,
  assertValidSlug,
  listAdminPosts,
  normalizeStringArray,
  requireAdmin,
  writeAdminPost,
} from '../../../../lib/admin'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return

  try {
    if (req.method === 'GET') {
      const locale = typeof req.query.locale === 'string' ? req.query.locale : undefined
      return res.status(200).json({ posts: listAdminPosts(locale) })
    }

    if (req.method === 'POST') {
      const { locale, frontmatter, content } = req.body || {}

      if (typeof locale !== 'string' || typeof content !== 'string' || !frontmatter) {
        return res.status(400).json({ error: 'Missing fields' })
      }

      assertAdminLocale(locale)
      assertValidSlug(frontmatter.slug)

      const post = writeAdminPost(locale, {
        frontmatter: {
          title: String(frontmatter.title || '').trim(),
          date: String(frontmatter.date || '').trim(),
          summary: String(frontmatter.summary || '').trim(),
          slug: String(frontmatter.slug || '').trim(),
          image: String(frontmatter.image || '').trim() || undefined,
          imageAlt: String(frontmatter.imageAlt || '').trim() || undefined,
          categories: normalizeStringArray(frontmatter.categories),
          tags: normalizeStringArray(frontmatter.tags),
          author: String(frontmatter.author || '').trim() || undefined,
          featured: typeof frontmatter.featured === 'boolean' ? frontmatter.featured : undefined,
        },
        content,
      })

      return res.status(200).json({ post })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return res.status(400).json({ error: message })
  }
}
