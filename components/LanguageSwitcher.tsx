import { useRouter } from 'next/router'
import Link from 'next/link'

const LanguageSwitcher = () => {
  const { locale, locales, asPath } = useRouter()

  return (
    <span style={{ marginLeft: 'auto' }}>
      🌐
      {locales?.map((lng) => (
        <Link
          key={lng}
          href={asPath}
          locale={lng}
          style={{
            margin: '0 0.5rem',
            fontWeight: locale === lng ? 'bold' : 'normal',
            textDecoration: locale === lng ? 'underline' : 'none'
          }}
        >
          {lng}
        </Link>
      ))}
    </span>
  )
}

export default LanguageSwitcher
