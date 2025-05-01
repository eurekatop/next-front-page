'use client'

import Link from 'next/link'
import { ReactNode, useEffect, useState } from 'react'
import LanguageSwitcher from './LanguageSwitcher'

export default function Layout({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false)

  // Inicialitza l'estat segons localStorage
  useEffect(() => {
    const storedMode = localStorage.getItem('theme')
    if (storedMode === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Aplica canvis al DOM i guarda al localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  return (
    <>
      <header className="header">
        <nav className="nav">
          <Link href="/" className="nav-link">Inici</Link>
          <Link href="/blog" className="nav-link">Blog</Link>
          <Link href="/blog/categories" className="nav-link">Categories</Link>
        </nav>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <LanguageSwitcher />
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'none',
              border: '1px solid currentColor',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'inherit',
              marginLeft: '1rem'
            }}
          >
            {darkMode ? '☀️ Mode clar' : '🌙 Mode fosc'}
          </button>
        </div>
      </header>

      <main className="container">
        {children}
      </main>

      <footer className="footer">
        <div className="footer-content">
          © Eurekatop {new Date().getFullYear()} — Creat amb 💻 i cafeïna ☕
        </div>
      </footer>
    </>
  )
}
