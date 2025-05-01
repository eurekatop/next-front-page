import { GetServerSideProps } from 'next'
import { getPostBySlug } from '../../lib/posts'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import CustomLink from '../../components/CustomLink'

const components = {
  a: CustomLink,
}

export default function PostPage({ source, frontmatter }) {
  const { t } = useTranslation('common')  

  return (
    <div>
      <h1>{frontmatter.title}</h1>
      {frontmatter.image && (
  <img
    src={frontmatter.image}
    alt={frontmatter.title}
    style={{
      display: 'block',
      maxWidth: '300px',
      width: '100%',
      height: 'auto',
      margin: '1rem auto',
      borderRadius: '8px',
    }}
  />
)}
      <MDXRemote {...source} components={components} />
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
