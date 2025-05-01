import Link from 'next/link'
import { ReactNode } from 'react'
import LanguageSwitcher from './LanguageSwitcher'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <header style={{ padding: '1rem', background: '#222', color: '#fff' }}>
        <nav style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link href="/" style={{ color: '#fff', marginRight: '1rem' }}>Inici</Link>
          <Link href="/blog" style={{ color: '#fff', marginRight: '1rem' }}>Blog</Link>
          <Link href="/blog/categories" style={{ color: '#fff' }}>Categories</Link>
        </nav>
        <LanguageSwitcher />
      </header>

      <main className="container">
        {children}
      </main>

      <footer style={{ padding: '1rem', background: '#eee', marginTop: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', fontSize: '0.9rem' }}>
          © Eurekatop {new Date().getFullYear()} — Creat amb 💻 i cafeïna ☕
        </div>
      </footer>
    </>
  )
}
