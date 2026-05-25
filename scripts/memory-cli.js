#!/usr/bin/env node
/**
 * Memory CLI
 *
 * Purpose: allow any (AI) agent to create a blog post via the existing /admin API.
 *
 * Input: JSON matching ./proposal-spec-ia-redactor.json
 *   {
 *     "locale": "ca" | "es" | "en",
 *     "frontmatter": { title, date, summary, slug, image?, imageAlt?, categories?, tags?, author?, featured? },
 *     "content": "md/mdx string"
 *   }
 *
 * Auth:
 * - This CLI uses the existing cookie-based admin session (POST /api/admin/login), then POSTs to /api/admin/posts.
 * - It supports reading the password from environment variables, including the requested `API-KEY`.
 *
 * Security note (risk evaluation):
 * - `API-KEY`/password grants full admin access (upload + write posts). Treat it like a production secret.
 * - Prefer HTTPS + loopback/allowlisted server URLs; avoid passing secrets on the command line.
 * - The session cookie is stored only in-memory for the process lifetime.
 */

'use strict'

const fs = require('fs')
const path = require('path')

function usage(exitCode = 1) {
  const msg = `\
Usage:
  node scripts/memory-cli.js post [--input <file.json>|--stdin] [--server <url>] [--password <pwd>]

Options:
  --input, -i     Path to JSON file. If omitted, reads stdin.
  --stdin         Force stdin read.
  --server, -s    Base URL for the running Next server (default: http://localhost:3000).
  --password, -p  Admin password (discouraged). Prefer env vars.
  --env-file      Env file to load (default: ./.env if present).
  --dry-run       Validate and print request payload; do not POST.
  --spec          Print the JSON spec + guidelines for agents and exit.

Environment (checked in this order):
  API-KEY, API_KEY, ADMIN_PASSWORD
`
  process.stderr.write(msg)
  process.exit(exitCode)
}

function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--') {
      args._.push(...argv.slice(i + 1))
      break
    }

    if (a.startsWith('-')) {
      const next = argv[i + 1]
      const take = () => {
        if (!next || next.startsWith('-')) usage(1)
        i++
        return next
      }

      switch (a) {
        case 'post':
          args._.push('post')
          break
        case '--input':
        case '-i':
          args.input = take()
          break
        case '--stdin':
          args.stdin = true
          break
        case '--server':
        case '-s':
          args.server = take()
          break
        case '--password':
        case '-p':
          args.password = take()
          break
        case '--env-file':
          args.envFile = take()
          break
        case '--dry-run':
          args.dryRun = true
          break
        case '--spec':
          args.spec = true
          break
        case '--help':
        case '-h':
          usage(0)
          break
        default:
          usage(1)
      }
      continue
    }

    args._.push(a)
  }
  return args
}

function loadDotEnv(envFilePath) {
  const result = {}
  if (!envFilePath) return result
  if (!fs.existsSync(envFilePath)) return result

  const raw = fs.readFileSync(envFilePath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue

    const key = trimmed.slice(0, idx).trim()
    let val = trimmed.slice(idx + 1).trim()

    // strip simple quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }

    if (key && !(key in process.env)) {
      result[key] = val
    }
  }

  return result
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => (data += chunk))
    process.stdin.on('end', () => resolve(data))
    process.stdin.on('error', reject)
  })
}

function isValidSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    const items = value.map((v) => String(v).trim()).filter(Boolean)
    return items.length ? items : undefined
  }
  if (typeof value === 'string') {
    const items = value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
    return items.length ? items : undefined
  }
  return undefined
}

function printSpec() {
  const specPath = path.join(process.cwd(), 'proposal-spec-ia-redactor.json')
  let specJson = null
  try {
    specJson = JSON.parse(fs.readFileSync(specPath, 'utf8'))
  } catch {
    // ignore; we'll still print guidelines
  }

  const guidelines = {
    specFile: 'proposal-spec-ia-redactor.json',
    payloadShape: {
      locale: 'ca | es | en',
      frontmatter: {
        title: 'string (required)',
        date: 'YYYY-MM-DD (required)',
        summary: 'string (required)',
        slug: 'kebab-case (required)',
        image: 'string (optional, public URL or path)',
        imageAlt: 'string (optional)',
        categories: 'string[] (optional)',
        tags: 'string[] (optional)',
        author: 'string (optional)',
        featured: 'boolean (optional)',
      },
      content: 'string (required; markdown/mdx)',
    },
    constraints: {
      slugRegex: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
      notes: [
        'Use lowercase letters/numbers and dashes only for slug.',
        'categories/tags should be arrays (the API also accepts comma-separated strings, but arrays are preferred).',
        'content is raw markdown/mdx; frontmatter is sent as JSON and will be written to an .mdx file.',
      ],
    },
    example: {
      locale: 'ca',
      frontmatter: {
        title: 'My title',
        date: '2026-05-25',
        summary: 'One-paragraph summary.',
        slug: 'my-title',
        categories: ['blog'],
        tags: ['ia', 'productivitat'],
        author: 'Francesc',
        featured: false,
      },
      content: '# Heading\n\nYour post content...',
    },
  }

  process.stdout.write(
    JSON.stringify(
      {
        ...(specJson ? { specFromFile: specJson } : { specFromFile: null, specReadError: `Could not read ${specPath}` }),
        guidelines,
      },
      null,
      2,
    ) + '\n',
  )
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Input must be a JSON object')

  const { locale, frontmatter, content } = payload
  if (!['ca', 'es', 'en'].includes(locale)) throw new Error('locale must be one of: ca, es, en')
  if (!frontmatter || typeof frontmatter !== 'object') throw new Error('frontmatter must be an object')
  if (typeof content !== 'string') throw new Error('content must be a string')

  const fm = {
    title: String(frontmatter.title || '').trim(),
    date: String(frontmatter.date || '').trim(),
    summary: String(frontmatter.summary || '').trim(),
    slug: String(frontmatter.slug || '').trim(),
    image: String(frontmatter.image || '').trim() || undefined,
    imageAlt: String(frontmatter.imageAlt || '').trim() || undefined,
    categories: normalizeStringArray(frontmatter.categories),
    tags: normalizeStringArray(frontmatter.tags),
    author: String(frontmatter.author || '').trim() || undefined,
    featured: typeof frontmatter.featured === 'boolean' ? frontmatter.featured : undefined,
  }

  if (!fm.title) throw new Error('frontmatter.title is required')
  if (!fm.date) throw new Error('frontmatter.date is required')
  if (!fm.summary) throw new Error('frontmatter.summary is required')
  if (!fm.slug) throw new Error('frontmatter.slug is required')
  if (!isValidSlug(fm.slug)) throw new Error('frontmatter.slug is invalid (use lowercase a-z0-9 and dashes)')

  return { locale, frontmatter: fm, content }
}

async function jsonFetch(url, options = {}) {
  // NOTE: spread order matters. `...options` can include `headers`, so we must
  // merge headers and then set them last.
  const mergedHeaders = { 'Content-Type': 'application/json', ...(options.headers || {}) }

  const res = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (data && data.error) || `Request failed: ${res.status} ${res.statusText}`
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }

  return { res, data }
}

async function main() {
  const argv = process.argv.slice(2)
  const args = parseArgs(argv)

  // No params: print spec for agents (so they know what to generate) and exit.
  if (argv.length === 0) {
    printSpec()
    return
  }

  if (args.spec) {
    printSpec()
    return
  }

  const command = args._[0] || 'post'
  if (command !== 'post') usage(1)

  const envFile = args.envFile || path.join(process.cwd(), '.env')
  const dotEnv = loadDotEnv(envFile)

  const server = String(args.server || process.env.MEMORY_CLI_SERVER || dotEnv.MEMORY_CLI_SERVER || 'http://localhost:3000')
    .replace(/\/$/, '')

  const password =
    args.password ||
    process.env['API-KEY'] ||
    dotEnv['API-KEY'] ||
    process.env.API_KEY ||
    dotEnv.API_KEY ||
    process.env.ADMIN_PASSWORD ||
    dotEnv.ADMIN_PASSWORD ||
    ''

  if (!password && !args.dryRun) {
    throw new Error('Missing credentials. Set API-KEY (or API_KEY / ADMIN_PASSWORD), or pass --password.')
  }

  let rawInput = ''
  if (args.input) {
    rawInput = fs.readFileSync(path.resolve(process.cwd(), args.input), 'utf8')
  } else {
    // default to stdin (works with pipes)
    rawInput = await readStdin()
  }

  if (!rawInput.trim()) throw new Error('No input provided (empty JSON)')

  let payload
  try {
    payload = JSON.parse(rawInput)
  } catch {
    throw new Error('Invalid JSON input')
  }

  const validated = validatePayload(payload)

  if (args.dryRun) {
    process.stdout.write(JSON.stringify({ server, request: validated }, null, 2) + '\n')
    return
  }

  // 1) login -> capture session cookie
  const loginUrl = `${server}/api/admin/login`
  const { res: loginRes } = await jsonFetch(loginUrl, {
    method: 'POST',
    body: JSON.stringify({ password }),
  })

  const setCookie = loginRes.headers.get('set-cookie') || ''
  const cookie = setCookie.split(';')[0] // eurekatop_admin=...
  if (!cookie) throw new Error('Login did not return a session cookie')

  // 2) create post
  const postsUrl = `${server}/api/admin/posts`
  const { data } = await jsonFetch(postsUrl, {
    method: 'POST',
    headers: { Cookie: cookie },
    body: JSON.stringify(validated),
  })

  process.stdout.write(JSON.stringify({ ok: true, post: data.post }, null, 2) + '\n')
}

main().catch((err) => {
  process.stderr.write(`${err && err.message ? err.message : String(err)}\n`)
  process.exit(1)
})
