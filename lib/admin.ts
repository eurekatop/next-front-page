import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import type { NextApiRequest, NextApiResponse } from 'next'
import matter from 'gray-matter'
import type { Frontmatter } from './posts'

export const adminLocales = ['ca', 'es', 'en'] as const

export type AdminLocale = (typeof adminLocales)[number]

export interface AdminPostSummary {
  locale: AdminLocale
  slug: string
  filename: string
  frontmatter: Frontmatter
}

export interface AdminPost extends AdminPostSummary {
  content: string
}

const sessionCookieName = 'eurekatop_admin'
const sessionMaxAgeSeconds = 60 * 60 * 24 * 7

export function getContentBaseDir() {
  if (!process.env.BASE_CONTENT_DIR) {
    throw new Error('BASE_CONTENT_DIR is not set')
  }

  return path.resolve(process.cwd(), process.env.BASE_CONTENT_DIR)
}

export function getImagesDir() {
  const imagesDir = process.env.CONTENT_IMAGES_DIR || 'images/uploads'
  return safeJoin(getContentBaseDir(), imagesDir)
}

export function isAdminLocale(locale: string): locale is AdminLocale {
  return adminLocales.includes(locale as AdminLocale)
}

export function assertAdminLocale(locale: string): asserts locale is AdminLocale {
  if (!isAdminLocale(locale)) {
    throw new Error('Invalid locale')
  }
}

export function isValidSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

export function assertValidSlug(slug: string) {
  if (!isValidSlug(slug)) {
    throw new Error('Invalid slug')
  }
}

export function safeJoin(baseDir: string, ...segments: string[]) {
  const resolvedBase = path.resolve(baseDir)
  const resolvedPath = path.resolve(resolvedBase, ...segments)

  if (resolvedPath !== resolvedBase && !resolvedPath.startsWith(resolvedBase + path.sep)) {
    throw new Error('Invalid path')
  }

  return resolvedPath
}

export function getPostsDir(locale: AdminLocale) {
  return safeJoin(getContentBaseDir(), 'posts', locale)
}

export function getPostPath(locale: AdminLocale, slug: string) {
  assertValidSlug(slug)
  return safeJoin(getPostsDir(locale), `${slug}.mdx`)
}

export function listAdminPosts(locale?: string): AdminPostSummary[] {
  const locales = locale ? [locale] : adminLocales
  const posts: AdminPostSummary[] = []

  for (const currentLocale of locales) {
    assertAdminLocale(currentLocale)
    const dir = getPostsDir(currentLocale)

    if (!fs.existsSync(dir)) continue

    for (const filename of fs.readdirSync(dir)) {
      if (!filename.endsWith('.mdx')) continue

      const fullPath = safeJoin(dir, filename)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      const slug = typeof data.slug === 'string' && data.slug ? data.slug : filename.replace(/\.mdx$/, '')

      posts.push({
        locale: currentLocale,
        slug,
        filename,
        frontmatter: { ...data, slug } as Frontmatter,
      })
    }
  }

  return posts.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date || 0).getTime()
    const dateB = new Date(b.frontmatter.date || 0).getTime()
    return dateB - dateA
  })
}

export function readAdminPost(locale: string, slug: string): AdminPost {
  assertAdminLocale(locale)
  assertValidSlug(slug)

  const filePath = getPostPath(locale, slug)
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    locale,
    slug,
    filename: `${slug}.mdx`,
    frontmatter: { ...data, slug: data.slug || slug } as Frontmatter,
    content,
  }
}

export function writeAdminPost(locale: string, post: { frontmatter: Frontmatter; content: string }) {
  assertAdminLocale(locale)
  assertValidSlug(post.frontmatter.slug)

  const dir = getPostsDir(locale)
  fs.mkdirSync(dir, { recursive: true })

  const filePath = getPostPath(locale, post.frontmatter.slug)
  const mdx = matter.stringify(post.content.trimStart(), normalizeFrontmatter(post.frontmatter))
  fs.writeFileSync(filePath, mdx, 'utf8')

  return readAdminPost(locale, post.frontmatter.slug)
}

export function normalizeStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const items = value.map((item) => String(item).trim()).filter(Boolean)
    return items.length ? items : undefined
  }

  if (typeof value === 'string') {
    const items = value.split(',').map((item) => item.trim()).filter(Boolean)
    return items.length ? items : undefined
  }

  return undefined
}

export function normalizeFrontmatter(frontmatter: Frontmatter): Frontmatter {
  const normalized: Frontmatter = {
    title: frontmatter.title,
    date: frontmatter.date,
    summary: frontmatter.summary,
    slug: frontmatter.slug,
  }

  if (frontmatter.image) normalized.image = frontmatter.image
  if (frontmatter.imageAlt) normalized.imageAlt = frontmatter.imageAlt
  if (frontmatter.categories?.length) normalized.categories = frontmatter.categories
  if (frontmatter.tags?.length) normalized.tags = frontmatter.tags
  if (frontmatter.author) normalized.author = frontmatter.author
  if (typeof frontmatter.featured === 'boolean') normalized.featured = frontmatter.featured

  return normalized
}

export function getUploadPublicUrl(filename: string) {
  return `/images/uploads/${filename}`
}

export function sanitizeUploadFilename(filename: string) {
  const extension = path.extname(filename).toLowerCase()
  const basename = path.basename(filename, extension)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  const safeBase = basename || 'image'
  return `${safeBase}-${Date.now()}${extension}`
}

export function isAllowedImage(filename: string, mimeType: string) {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  return allowedExtensions.includes(path.extname(filename).toLowerCase()) && allowedMimeTypes.includes(mimeType)
}

export function saveUploadedImage(input: { filename: string; mimeType: string; data: string }) {
  if (!isAllowedImage(input.filename, input.mimeType)) {
    throw new Error('Unsupported image type')
  }

  const base64 = input.data.includes(',') ? input.data.split(',').pop() || '' : input.data
  const buffer = Buffer.from(base64, 'base64')
  const maxBytes = 5 * 1024 * 1024

  if (!buffer.length || buffer.length > maxBytes) {
    throw new Error('Invalid image size')
  }

  const filename = sanitizeUploadFilename(input.filename)
  const dir = getImagesDir()
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(safeJoin(dir, filename), buffer)

  return {
    filename,
    url: getUploadPublicUrl(filename),
  }
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || ''
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || getAdminPassword()
}

function sign(value: string) {
  return crypto.createHmac('sha256', getSessionSecret()).update(value).digest('hex')
}

function createSessionValue() {
  const issuedAt = Math.floor(Date.now() / 1000).toString()
  return `${issuedAt}.${sign(issuedAt)}`
}

function parseCookies(req: NextApiRequest) {
  const cookieHeader = req.headers.cookie || ''
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separator = cookie.indexOf('=')
        return [cookie.slice(0, separator), decodeURIComponent(cookie.slice(separator + 1))]
      }),
  )
}

function timingSafeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

export function isAdminAuthenticated(req: NextApiRequest) {
  const session = parseCookies(req)[sessionCookieName]
  if (!session || !getSessionSecret()) return false

  const [issuedAt, signature] = session.split('.')
  if (!issuedAt || !signature || !timingSafeEqual(signature, sign(issuedAt))) return false

  const age = Math.floor(Date.now() / 1000) - Number(issuedAt)
  return Number.isFinite(age) && age >= 0 && age <= sessionMaxAgeSeconds
}

export function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }

  return true
}

export function setAdminSessionCookie(res: NextApiResponse) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${sessionCookieName}=${encodeURIComponent(createSessionValue())}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionMaxAgeSeconds}${secure}`,
  )
}

export function clearAdminSessionCookie(res: NextApiResponse) {
  res.setHeader('Set-Cookie', `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
}

export function checkAdminPassword(password: string) {
  const expected = getAdminPassword()
  return Boolean(expected) && timingSafeEqual(password, expected)
}
