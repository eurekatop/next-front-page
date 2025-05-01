import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getPostSlugs, getPostBySlug } from '../../lib/posts'

export default function BlogIndex({ posts }) {
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
    </div>
  )
}

export async function getServerSideProps({ locale }) {
  const slugs = getPostSlugs(locale)
  const posts = slugs.map((slug) => getPostBySlug(slug, locale))

  return {
    props: {
      posts,
      ...(await serverSideTranslations(locale, ['common']))
    }
  }
}