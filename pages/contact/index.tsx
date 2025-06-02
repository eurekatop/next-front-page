'use client'

import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'


export default function ContactPage() {
  const { t } = useTranslation('common')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')

    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setStatus('sent')
        form.reset()
      } else {
        throw new Error('Failed')
      }
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <>
      <section className="max-w-xl mx-auto mt-12 px-4">
        <h1 className="text-3xl font-bold mb-4">{t('contact.title') || 'Contacta amb mi'}</h1>
        <p className="mb-6">{t('contact.subtitle') || 'Pots escriure’m el que vulguis. Et respondré aviat.'}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder={t('contact.form.name')}
            required
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="email"
            name="email"
            placeholder={t('contact.form.email')}
            required
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="text"
            name="subject"
            placeholder={t('contact.form.subject')}
            required
            className="w-full px-4 py-2 border rounded"
          />
          <textarea
            name="message"
            placeholder={t('contact.form.message')}
            required
            className="w-full px-4 py-2 border rounded"
          />

          <button
            type="submit"
            disabled={status === 'sending'}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {status === 'sending' ? t('contact.sending') : t('contact.send_button')}
          </button>

          {status === 'sent' && <p className="text-green-600">{t('contact.sent_success')}</p>}
          {status === 'error' && <p className="text-red-600">{t('contact.sent_error')}</p>}
        </form>
      </section>
    </>
  )
}

export async function getServerSideProps({ locale }) {

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common']))
    }
  }
}