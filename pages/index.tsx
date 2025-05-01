import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getPostBySlug, getPostSlugs } from '../lib/posts'


type Props = {
  posts: {
    slug: string
    frontmatter: {
      title: string
      date: string
      categories?: string[]
    }
  }[]
}

export default function BlogIndex({ posts }: Props) {
  const { t } = useTranslation('common')

  return (
    <div>
      <h1>{t('blog')}</h1>
      {posts.length === 0 ? (
        <p>{t('no_posts')}</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`}>
                {post.frontmatter.title}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: '2rem' }}>
        🌐 <b>{t('change_language')}:</b>
        <ul>
          <li><Link href="/blog" locale="ca">Català</Link></li>
          <li><Link href="/blog" locale="es">Castellano</Link></li>
          <li><Link href="/blog" locale="en">English</Link></li>
        </ul>
      </div>

    </div>
  )
}

export async function getStaticProps({ locale }: { locale: string }) {
  const slugs = getPostSlugs(locale)
  const posts = slugs.map((slug) => getPostBySlug(slug, locale))

  return {
    props: {
      posts,
      ...(await serverSideTranslations(locale, ['common']))
    }
  }
}
