import Link from 'next/link'
import { getPostSlugs, getPostBySlug } from '../lib/posts'

export default function Home({ posts }) {
  return (
    <div className="container">
      <h1>Benvingut a Eurekatop</h1>
      <p>Explora idees, tecnologia i contingut. Tot el que no sabies que volies llegir. 😉</p>

      <h2>Últims articles</h2>
      <ul>
        {posts.slice(0, 5).map((post) => (
          <li key={post.slug} className="card">
            <Link href={`/blog/${post.slug}`}>
              <strong>{post.frontmatter.title}</strong>
            </Link>
            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
              {new Date(post.frontmatter.date).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: '2rem' }}>
        <Link href="/blog">Veure tots els articles →</Link>
      </p>
    </div>
  )
}


export async  function getServerSideProps({ locale }) {
  const slugs = getPostSlugs(locale)
  const posts = slugs
    .map((slug) => getPostBySlug(slug, locale))
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())

  return {
    props: {
      posts,
    },
  }
}