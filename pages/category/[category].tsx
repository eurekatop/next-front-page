import { getPostSlugs, getPostBySlug } from '../../lib/posts'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

export default function CategoryPage({ category, posts }) {
  const { t, i18n } = useTranslation('common')

  return (
    <div>
      <h1>{t('category')}: {category}</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link 
              rel="alternate" 
              hrefLang={i18n.language}
              href={`/${i18n.language}/blog/${post.slug}`}
              locale="ca">{post.frontmatter.title}</Link>
          </li>
        ))}
      </ul>
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
