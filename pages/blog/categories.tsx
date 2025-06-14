import Link from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { getPostBySlug, getPostSlugs } from '../../lib/posts'


export default function CategoriesPage({ categories }: { categories: string[] }) {
  const { t, i18n } = useTranslation('common')

  return (
    <div>
      <h1>{t('categories')}</h1>
      <ul>
        {categories.map((cat) => (
          <li key={cat}>
            <Link 
              rel="alternate"
              hrefLang={`${i18n.language}`}
              href={`/${i18n.language}/category/${cat}`}>{cat}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

//export async function getStaticProps({ locale }: { locale: string }) {
//  const slugs = getPostSlugs(locale)
//  const posts = slugs.map((slug) => getPostBySlug(slug, locale))
//
//  const categories = new Set<string>()
//  posts.forEach((post) => {
//    (post.frontmatter.categories || ['Sense categoria']).forEach((cat) => {
//      categories.add(cat)
//    })
//  })
//
//  return {
//    props: {
//      categories: Array.from(categories),
//      ...(await serverSideTranslations(locale, ['common']))
//    }
//  }
//}

export async function getServerSideProps({ locale }: { locale: string }) {
  const slugs = getPostSlugs(locale)
  const posts = slugs.map((slug) => getPostBySlug(slug, locale))

  const categories = new Set<string>()
  posts.forEach((post) => {
    (post.frontmatter.categories || ['Sense categoria']).forEach((cat) => {
      categories.add(cat)
    })
  })

  return {
    props: {
      categories: Array.from(categories),
      ...(await serverSideTranslations(locale, ['common']))
    }
  }
}
