import { Feed } from 'feed';

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&#39;');
}

export function generateRssFeed(posts: any[], locale: string) {
  const siteUrl = 'https://eurekatop.com'; 
  const feed = new Feed({
    title: 'Eurekatop',
    description: 'Latest posts from Eurekatop',
    id: siteUrl,
    link: siteUrl,
    language: 'en',
    image: `${siteUrl}/logo.png`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss: `${siteUrl}/api/rss.xml?locale=${locale}`, 
    },
  });

  posts.forEach(post => {

    console.log('Post:', post);

    feed.addItem({
      title: post.frontmatter.title || '[Sense títol]',
      id: `${siteUrl}/${locale}/blog/${post.frontmatter.slug}`,
      link: `${siteUrl}/${locale}/blog/${post.frontmatter.slug}`,
      description: escapeHtml(post.frontmatter.summary),
      content: escapeHtml(post.contentHtml || post.content),
      date: new Date(post.frontmatter.date),
    });
  });

  return feed.rss2(); // or feed.atom1(), feed.json1()
}
