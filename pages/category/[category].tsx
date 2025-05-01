import { getPostSlugs, getPostBySlug } from '../../lib/posts'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

export default function CategoryPage({ category, posts }) {
  const { t } = useTranslation('common')

  return (
    <div>
      <h1>{t('category')}: {category}</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>{post.frontmatter.title}</Link>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '2rem' }}>
        🌐 <b>{t('change_language')}:</b>
        <ul>
          <li><Link href={`/category/${category}`} locale="ca">Català</Link></li>
          <li><Link href={`/category/${category}`} locale="es">Castellano</Link></li>
          <li><Link href={`/category/${category}`} locale="en">English</Link></li>
        </ul>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
  const category = params?.category

  if (!category || typeof category !== 'string') {
    return { notFound: true }
  }

  const slugs = getPostSlugs(locale!)
  const posts = slugs.map((slug) => getPostBySlug(slug, locale!))

  const filtered = posts.filter((post) =>
    (post.frontmatter.categories || ['Sense categoria']).includes(category)
  )

  return {
    props: {
      category,
      posts: filtered,
      ...(await serverSideTranslations(locale!, ['common']))
    }
  }
}
