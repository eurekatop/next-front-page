import type { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { subject, message, name, email } = req.body

  if (!subject || !message || !name || !email) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  try {
    const result = await resend.emails.send({
      from: 'eurekatop@resend.dev', // has to be verified or valid
      to: 'rfranr@gmail.com',
      subject: `${subject}`,
      html: `
        <p><strong>Missatge:</strong> ${message}</p>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Correu:</strong> ${email}</p>
      `,
    })

    return res.status(200).json({ success: true, result })
  } catch (error) {
    console.error('Error enviant el correu:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
