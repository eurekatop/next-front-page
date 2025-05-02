
import { NextApiRequest, NextApiResponse } from 'next';
import { getPostSlugs, getPostBySlug } from '../../lib/posts'
import { generateRssFeed } from '../../lib/rss';

const baseUrl = 'https://eurekatop.com' 


export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { locale } = req.query;

    if (typeof locale !== 'string' || !['ca', 'es', 'en'].includes(locale)) {
      res.status(400).send('Invalid or missing locale');
      return;
    }
  
    const slugs = getPostSlugs(locale);
    const posts = slugs.map((slug) => getPostBySlug(slug.replace(/\.mdx$/, ''), locale));
  
    console.log('posts', posts);

    const rss = generateRssFeed(posts, locale); // Pass locale to feed generator
  
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.write(rss);
    res.end();

  return {
    props: {}, // No props needed
  };
}
