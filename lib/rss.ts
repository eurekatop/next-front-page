import { Feed } from 'feed';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import { marked } from 'marked';

const window = new JSDOM('').window as any;
const DOMPurify = createDOMPurify(window);


function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&#39;');
}

//TODO: type posts
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

    const html = marked(post.content);
    const cleanHtml = DOMPurify.sanitize(html as string);
    

    feed.addItem({
      title: post.frontmatter.title || '[Sense títol]',
      id: `${siteUrl}/${locale}/blog/${post.frontmatter.slug}`,
      link: `${siteUrl}/${locale}/blog/${post.frontmatter.slug}`,
      description: escapeHtml(post.frontmatter.summary),
      content: cleanHtml,
      date: new Date(post.frontmatter.date),
    });
  });

  return feed.rss2(); // or feed.atom1(), feed.json1()
}
