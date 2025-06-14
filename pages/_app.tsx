import '../public/global.css'
import '../public/styles.css'
import { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
import Layout from '../components/Layout'
import '../public/variables.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default appWithTranslation(MyApp)
