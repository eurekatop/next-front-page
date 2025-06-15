import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getPostSlugs, getPostBySlug } from '../../lib/posts'

export default function BlogIndex({ posts }) {
  const { t } = useTranslation('common')

  return (
<div className="page-wrapper">
  <main className="main-column">
      <div>
      <h1>{t('blog')}</h1>
      {posts.length === 0 ? (
        <p>{t('no_posts')}</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link 
                rel='alternate'
                hrefLang={post.locale}
                href={`/blog/${post.slug}`}>
                {post.frontmatter.title}
              </Link>
              <div>
                {new Date(post.frontmatter.date).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </main>
</div>



  )
}

export async function getServerSideProps({ locale }) {
  const slugs = getPostSlugs(locale)
  const posts = slugs.map((slug) => getPostBySlug(slug, locale))

  const orderedPosts = posts.sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime(),
  )

  return {
    props: {
      posts:orderedPosts,
      ...(await serverSideTranslations(locale, ['common']))
    }
  }
}