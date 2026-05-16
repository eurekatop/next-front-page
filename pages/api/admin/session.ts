import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminAuthenticated } from '../../../lib/admin'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return res.status(200).json({ authenticated: isAdminAuthenticated(req) })
}
