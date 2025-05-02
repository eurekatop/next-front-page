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

    console.log('Post:', post);

    feed.addItem({
      title: post.frontmatter.title || '[Sense títol]',
      id: `${siteUrl}/${locale}/blog/${post.frontmatter.slug}`,
      link: `${siteUrl}/${locale}/blog/${post.frontmatter.slug}`,
      description: post.frontmatter.excerpt,
      content: post.contentHtml || post.content,
      date: new Date(post.frontmatter.date),
    });
  });

  return feed.rss2(); // or feed.atom1(), feed.json1()
}
