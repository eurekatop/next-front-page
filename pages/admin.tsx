import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import styles from './admin.module.css'

type Locale = 'ca' | 'es' | 'en'

type Frontmatter = {
  title: string
  date: string
  summary: string
  slug: string
  image?: string
  imageAlt?: string
  categories?: string[]
  tags?: string[]
  author?: string
  featured?: boolean
}

type PostSummary = {
  locale: Locale
  slug: string
  filename: string
  frontmatter: Frontmatter
}

type EditorState = {
  locale: Locale
  frontmatter: Frontmatter
  content: string
}

const locales: Locale[] = ['ca', 'es', 'en']

const emptyPost = (locale: Locale): EditorState => ({
  locale,
  frontmatter: {
    title: '',
    date: new Date().toISOString().slice(0, 10),
    summary: '',
    slug: '',
    image: '',
    imageAlt: '',
    categories: [],
    tags: [],
    author: '',
    featured: false,
  },
  content: '',
})

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [password, setPassword] = useState('')
  const [locale, setLocale] = useState<Locale>('ca')
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [editor, setEditor] = useState<EditorState>(() => emptyPost('ca'))
  const [selectedSlug, setSelectedSlug] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const uploadRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    fetch('/api/admin/session')
      .then((response) => response.json())
      .then((data) => setAuthenticated(Boolean(data.authenticated)))
      .finally(() => setCheckingSession(false))
  }, [])

  useEffect(() => {
    if (authenticated) {
      loadPosts(locale)
    }
  }, [authenticated, locale])

  useEffect(() => {
    let cancelled = false

    Promise.all([import('marked'), import('dompurify')]).then(async ([markedModule, dompurifyModule]) => {
      if (cancelled) return
      const html = await markedModule.marked.parse(editor.content || '')
      if (cancelled) return
      setPreviewHtml(dompurifyModule.default.sanitize(html))
    })

    return () => {
      cancelled = true
    }
  }, [editor.content])

  async function request(url: string, options?: RequestInit) {
    const response = await fetch(url, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      ...options,
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }

    return data
  }

  async function login(event: FormEvent) {
    event.preventDefault()
    setError('')
    setNotice('')

    try {
      await request('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      })
      setAuthenticated(true)
      setPassword('')
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed')
    }
  }

  async function logout() {
    await request('/api/admin/logout', { method: 'POST' })
    setAuthenticated(false)
    setPosts([])
  }

  async function loadPosts(nextLocale: Locale) {
    setError('')
    setLoading(true)

    try {
      const data = await request(`/api/admin/posts?locale=${nextLocale}`)
      setPosts(data.posts || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load posts')
    } finally {
      setLoading(false)
    }
  }

  async function loadPost(post: PostSummary) {
    setError('')
    setNotice('')

    try {
      const data = await request(`/api/admin/posts/${post.locale}/${post.slug}`)
      setSelectedSlug(post.slug)
      setEditor({
        locale: post.locale,
        frontmatter: {
          ...emptyPost(post.locale).frontmatter,
          ...data.post.frontmatter,
        },
        content: data.post.content || '',
      })
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load post')
    }
  }

  function startNewPost() {
    setSelectedSlug('')
    setEditor(emptyPost(locale))
    setError('')
    setNotice('')
  }

  function updateFrontmatter(field: keyof Frontmatter, value: string | boolean | string[]) {
    setEditor((current) => ({
      ...current,
      frontmatter: {
        ...current.frontmatter,
        [field]: value,
      },
    }))
  }

  function updateTitle(title: string) {
    setEditor((current) => ({
      ...current,
      frontmatter: {
        ...current.frontmatter,
        title,
        slug: selectedSlug ? current.frontmatter.slug : slugify(title),
      },
    }))
  }

  async function savePost(event: FormEvent) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (selectedSlug && selectedSlug !== editor.frontmatter.slug) {
      setError('Changing the slug of an existing post is not supported. Create a new post instead.')
      return
    }

    try {
      const data = await request('/api/admin/posts', {
        method: 'POST',
        body: JSON.stringify(editor),
      })
      setSelectedSlug(data.post.slug)
      setNotice('Post saved')
      await loadPosts(editor.locale)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save post')
    }
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setNotice('')

    try {
      const dataUrl = await readFileAsDataUrl(file)
      const upload = await request('/api/admin/upload', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          data: dataUrl,
        }),
      })
      insertMarkdown(`![${editor.frontmatter.imageAlt || 'Image'}](${upload.url})`)
      setNotice('Image uploaded')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed')
    } finally {
      event.target.value = ''
    }
  }

  function insertMarkdown(markdown: string) {
    const textarea = textareaRef.current

    if (!textarea) {
      setEditor((current) => ({ ...current, content: `${current.content}\n${markdown}\n` }))
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const nextContent = `${editor.content.slice(0, start)}${markdown}${editor.content.slice(end)}`
    setEditor((current) => ({ ...current, content: nextContent }))

    window.requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + markdown.length, start + markdown.length)
    })
  }

  if (checkingSession) {
    return <main className={styles.adminShell}>Checking session...</main>
  }

  if (!authenticated) {
    return (
      <main className={styles.adminShell}>
        <section className={`${styles.panel} ${styles.loginPanel}`}>
          <h1>Admin</h1>
          <form onSubmit={login}>
            <label className={styles.label}>
              Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            <div className={styles.actions}>
              <button type="submit">Log in</button>
            </div>
          </form>
          {error && <p className={styles.dangerText}>{error}</p>}
        </section>
      </main>
    )
  }

  return (
    <main className={styles.adminShell}>
      <div className={styles.toolbar}>
        <div>
          <h1>Admin</h1>
          <p>Edit file-based MDX posts in the external content repo.</p>
        </div>
        <button className={styles.secondaryButton} type="button" onClick={logout}>
          Log out
        </button>
      </div>

      {error && <p className={styles.dangerText}>{error}</p>}
      {notice && <p className={styles.successText}>{notice}</p>}

      <div className={styles.grid}>
        <aside className={styles.panel}>
          <label className={styles.label}>
            Locale
            <select
              value={locale}
              onChange={(event) => {
                const nextLocale = event.target.value as Locale
                setLocale(nextLocale)
                setEditor((current) => ({ ...current, locale: nextLocale }))
              }}
            >
              {locales.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.actions}>
            <button type="button" onClick={startNewPost}>
              New post
            </button>
          </div>

          <div className={styles.postList}>
            {loading && <p>Loading posts...</p>}
            {!loading && posts.length === 0 && <p>No posts.</p>}
            {posts.map((post) => (
              <button
                className={`${styles.postButton} ${selectedSlug === post.slug ? styles.postButtonActive : ''}`}
                key={`${post.locale}-${post.slug}`}
                type="button"
                onClick={() => loadPost(post)}
              >
                {post.frontmatter.title || post.slug}
                <span className={styles.postMeta}>{post.frontmatter.date || post.slug}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className={styles.panel}>
          <form onSubmit={savePost}>
            <div className={styles.formGrid}>
              <label className={styles.label}>
                Title
                <input value={editor.frontmatter.title} onChange={(event) => updateTitle(event.target.value)} required />
              </label>

              <label className={styles.label}>
                Slug
                <input
                  value={editor.frontmatter.slug}
                  onChange={(event) => updateFrontmatter('slug', slugify(event.target.value))}
                  disabled={Boolean(selectedSlug)}
                  required
                />
              </label>

              <label className={styles.label}>
                Date
                <input
                  type="date"
                  value={editor.frontmatter.date}
                  onChange={(event) => updateFrontmatter('date', event.target.value)}
                  required
                />
              </label>

              <label className={styles.label}>
                Author
                <input value={editor.frontmatter.author || ''} onChange={(event) => updateFrontmatter('author', event.target.value)} />
              </label>

              <label className={`${styles.label} ${styles.fullWidth}`}>
                Summary
                <textarea value={editor.frontmatter.summary} onChange={(event) => updateFrontmatter('summary', event.target.value)} required />
              </label>

              <label className={styles.label}>
                Cover image URL
                <input value={editor.frontmatter.image || ''} onChange={(event) => updateFrontmatter('image', event.target.value)} />
              </label>

              <label className={styles.label}>
                Cover image alt
                <input value={editor.frontmatter.imageAlt || ''} onChange={(event) => updateFrontmatter('imageAlt', event.target.value)} />
              </label>

              <label className={styles.label}>
                Categories, comma-separated
                <input
                  value={(editor.frontmatter.categories || []).join(', ')}
                  onChange={(event) => updateFrontmatter('categories', splitCsv(event.target.value))}
                />
              </label>

              <label className={styles.label}>
                Tags, comma-separated
                <input value={(editor.frontmatter.tags || []).join(', ')} onChange={(event) => updateFrontmatter('tags', splitCsv(event.target.value))} />
              </label>

              <label className={styles.label}>
                Featured
                <select
                  value={editor.frontmatter.featured ? 'true' : 'false'}
                  onChange={(event) => updateFrontmatter('featured', event.target.value === 'true')}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </label>
            </div>

            <div className={styles.actions}>
              <button type="submit">Save post</button>
              <button className={styles.secondaryButton} type="button" onClick={() => uploadRef.current?.click()}>
                Upload image
              </button>
              <input ref={uploadRef} className={styles.hiddenInput} type="file" accept="image/*" onChange={uploadImage} />
            </div>

            <div className={styles.editorGrid}>
              <label className={styles.label}>
                Markdown
                <textarea
                  ref={textareaRef}
                  className={styles.markdownTextarea}
                  value={editor.content}
                  onChange={(event) => setEditor((current) => ({ ...current, content: event.target.value }))}
                />
              </label>

              <div>
                <strong>Preview</strong>
                <article className={styles.preview} dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

function splitCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}
