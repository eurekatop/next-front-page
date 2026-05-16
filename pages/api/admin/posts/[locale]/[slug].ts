import type { NextApiRequest, NextApiResponse } from 'next'
import { readAdminPost, requireAdmin } from '../../../../../lib/admin'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const locale = typeof req.query.locale === 'string' ? req.query.locale : ''
  const slug = typeof req.query.slug === 'string' ? req.query.slug : ''

  try {
    return res.status(200).json({ post: readAdminPost(locale, slug) })
  } catch (error) {
    const message = error instanceof Error && 'code' in error && error.code === 'ENOENT'
      ? 'Post file not found'
      : error instanceof Error ? error.message : 'Post not found'
    return res.status(404).json({ error: message })
  }
}
