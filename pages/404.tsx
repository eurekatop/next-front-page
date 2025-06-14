import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

export default function Custom404() {
  const { t } = useTranslation('common');

  return (
    <div style={{ padding: '4rem' }}>
      <h1>404 - {t('not_found', 'Pàgina no trobada')}</h1>
      <p>{t('go_home', 'Torna a la pàgina principal')}</p>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
