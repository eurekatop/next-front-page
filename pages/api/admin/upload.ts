import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin, saveUploadedImage } from '../../../lib/admin'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '7mb',
    },
  },
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { filename, mimeType, data } = req.body || {}

    if (typeof filename !== 'string' || typeof mimeType !== 'string' || typeof data !== 'string') {
      return res.status(400).json({ error: 'Missing upload fields' })
    }

    const upload = saveUploadedImage({ filename, mimeType, data })
    return res.status(200).json(upload)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return res.status(400).json({ error: message })
  }
}
