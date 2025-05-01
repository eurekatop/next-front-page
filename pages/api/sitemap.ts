import { NextApiRequest, NextApiResponse } from 'next'
import { getPostSlugs, getPostBySlug } from '../../lib/posts'

const baseUrl = 'https://eurekatop.com' // 🔁 Substitueix pel teu domini real

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const locales = ['ca', 'es', 'en']
  const urls: string[] = []

  for (const locale of locales) {
    const slugs = getPostSlugs(locale)
    slugs.forEach((slug) => {
      const post = getPostBySlug(slug.replace(/\.mdx$/, ''), locale)
      const lastmod = new Date(post.frontmatter.date).toISOString()
      urls.push(`<url>
  <loc>${baseUrl}/${locale}/blog/${slug.replace(/\\.mdx$/, '')}</loc>
  <lastmod>${lastmod}</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>`)
    })

    urls.push(`<url>
  <loc>${baseUrl}/${locale}/blog</loc>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>`)

    urls.push(`<url>
  <loc>${baseUrl}/${locale}/blog/categories</loc>
  <changefreq>monthly</changefreq>
  <priority>0.5</priority>
</url>`)
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.write(sitemap)
  res.end()
}
