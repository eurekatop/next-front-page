import Link from 'next/link'

export default function CustomLink({ href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternal = href && (href.startsWith('/') || href.startsWith('#'))

  if (isInternal) {
    return <Link href={href!} {...props} />
  }

  return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
}
