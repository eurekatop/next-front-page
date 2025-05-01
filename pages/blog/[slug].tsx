import { GetServerSideProps } from 'next'
import { getPostBySlug } from '../../lib/posts'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export default function PostPage({ source, frontmatter }) {
  const { t } = useTranslation('common')  

  return (
    <div>
      <h1>{frontmatter.title}</h1>
      <MDXRemote {...source} />


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

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
  if (!params?.slug || typeof params.slug !== 'string') {
    return { notFound: true }
  }

  try {
    const post = getPostBySlug(params.slug, locale!)
    const mdxSource = await serialize(post.content)

    return {
      props: {
        source: mdxSource,
        frontmatter: post.frontmatter,
        ...(await serverSideTranslations(locale!, ['common']))
      }
    }
  } catch {
    return { notFound: true }
  }
}
