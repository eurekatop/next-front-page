import type { NextApiRequest, NextApiResponse } from 'next'
import { checkAdminPassword, setAdminSessionCookie } from '../../../lib/admin'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  if (!checkAdminPassword(password)) {
    return res.status(401).json({ error: 'Invalid password' })
  }

  setAdminSessionCookie(res)
  return res.status(200).json({ authenticated: true })
}
