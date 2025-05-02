import { Feed } from 'feed';

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
  });

  posts.forEach(post => {
    feed.addItem({
      title: post.title,
      id: `${siteUrl}/${locale}/blog/${post.slug}`,
      link: `${siteUrl}/${locale}/blog/${post.slug}`,
      description: post.excerpt,
      content: post.contentHtml || post.content,
      date: new Date(post.date),
    });
  });

  return feed.rss2(); // or feed.atom1(), feed.json1()
}
