"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import Head from "next/head";
import { useTranslation } from "next-i18next";
import GoogleTagManager from "./marketing/GoogleTagManager";

export default function Layout({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language;

  // Inicialitza l'estat segons localStorage
  useEffect(() => {
    const storedMode = localStorage.getItem("theme");
    if (storedMode === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Aplica canvis al DOM i guarda al localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <>
      <Head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`Eurekatop (${locale})`}
          href={`/api/rss.xml?locale=${locale}`}
        />
        <title>{t("page.index.meta_title")}</title>
        <meta name="description" content={t("page.index.meta_desc")} />

        <link rel="apple-touch-icon" sizes="180x180" href="/favicon_io/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png" />
        <link rel="manifest" href="/favicon_io/site.webmanifest"></link>
        <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet"></link>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet"></link>

      </Head>
      
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} gaId={process.env.NEXT_PUBLIC_GA_ID} />
<header className="header">
  <nav className="nav">
    <Link rel="alternate" hrefLang="x-default" href="/" className="nav-link">
      {t("topNav.home")}
    </Link>
    <Link rel="alternate" hrefLang="x-default" href="/blog" className="nav-link">
      {t("topNav.blog")}
    </Link>
    <Link rel="alternate" hrefLang="x-default" href="/blog/categories" className="nav-link">
      {t("topNav.categories")}
    </Link>
    <Link rel="alternate" hrefLang="ca" href="/mutiitu" className="nav-link">
      {t("topNav.old_blog")}
    </Link>
  </nav>

  {/* Bloc de la dreta */}
  <div className="header-controls">
    <LanguageSwitcher />
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="mode-toggle"
    >
      {darkMode ? t("light_mode") : t("dark_mode")}
    </button>
  </div>
</header>

      <main className="container">{children}</main>

      <footer className="footer">
        <a
          href={`/api/rss.xml?locale=${i18n.language}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          📰 RSS
        </a>
        <div className="footer-content">
          © Eurekatop {new Date().getFullYear()} — Creat amb 💻 i cafeïna ☕
        </div>
         <div className="footer-content">
          <a
            rel="alternate"
            hrefLang={`${i18n.language}`} 
            href={`/${i18n.language}/contact`}>{t("footer.contact_us")}</a>
        </div>
      </footer>
    </>
  );
}
