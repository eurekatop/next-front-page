import dynamic from 'next/dynamic'
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from './admin.module.css'

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false }) as any

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

type PreviewMode = 'live' | 'edit' | 'preview'

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
  const [previewMode, setPreviewMode] = useState<PreviewMode>('live')
  const [previewHtml, setPreviewHtml] = useState('')
  const [fullscreenEditor, setFullscreenEditor] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const uploadRef = useRef<HTMLInputElement | null>(null)
  const previewRef = useRef<HTMLElement | null>(null)
  const mdeRef = useRef<any>(null)
  const scrollCleanupRef = useRef<(() => void) | null>(null)

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
      const html = await markedModule.marked.parse(editor.content || '')
      if (!cancelled) {
        setPreviewHtml(dompurifyModule.default.sanitize(html))
      }
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

  async function saveCurrentPost() {
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

  async function savePost(event: FormEvent) {
    event.preventDefault()
    await saveCurrentPost()
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
    setEditor((current) => ({
      ...current,
      content: `${current.content}${current.content.endsWith('\n') || !current.content ? '' : '\n'}${markdown}\n`,
    }))
  }

  const handleEditorChange = useCallback((value: string) => {
    setEditor((current) => ({ ...current, content: value || '' }))
  }, [])

  const syncPreviewScroll = useCallback((codeMirror: any) => {
    const preview = previewRef.current
    if (!preview || previewMode !== 'live') return

    const editorScroll = codeMirror.getScrollInfo()
    const editorScrollable = editorScroll.height - editorScroll.clientHeight
    const previewScrollable = preview.scrollHeight - preview.clientHeight

    if (editorScrollable <= 0 || previewScrollable <= 0) {
      preview.scrollTop = 0
      return
    }

    preview.scrollTop = (editorScroll.top / editorScrollable) * previewScrollable
  }, [previewMode])

  const handleMdeInstance = useCallback((instance: any) => {
    if (!instance || mdeRef.current === instance) return

    scrollCleanupRef.current?.()
    mdeRef.current = instance

    const codeMirror = instance.codemirror
    if (!codeMirror) return

    const scrollHandler = () => syncPreviewScroll(codeMirror)
    codeMirror.on('scroll', scrollHandler)
    codeMirror.addKeyMap({
      PageUp: (cm: any) => {
        const scroll = cm.getScrollInfo()
        cm.scrollTo(null, Math.max(0, scroll.top - scroll.clientHeight))
      },
      PageDown: (cm: any) => {
        const scroll = cm.getScrollInfo()
        cm.scrollTo(null, scroll.top + scroll.clientHeight)
      },
    })

    scrollCleanupRef.current = () => {
      codeMirror.off('scroll', scrollHandler)
    }
  }, [syncPreviewScroll])

  useEffect(() => {
    const codeMirror = mdeRef.current?.codemirror
    if (codeMirror) {
      window.requestAnimationFrame(() => syncPreviewScroll(codeMirror))
    }
  }, [editor.content, previewMode, fullscreenEditor, syncPreviewScroll])

  useEffect(() => {
    return () => {
      scrollCleanupRef.current?.()
    }
  }, [])

  const editorOptions = useMemo(
    () => ({
      autofocus: false,
      minHeight: fullscreenEditor ? 'calc(100vh - 190px)' : '620px',
      previewClass: ['editor-preview', styles.markdownPreview],
      renderingConfig: {
        singleLineBreaks: false,
      },
      sideBySideFullscreen: false,
      spellChecker: false,
      status: false,
      extraKeys: {
        PageUp: false,
        PageDown: false,
      },
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        'code',
        'table',
        '|',
        'guide',
      ],
    }),
    [fullscreenEditor],
  )

  const editorActions = (
    <div className={styles.editorActions}>
      <label className={styles.inlineLabel}>
        View
        <select value={previewMode} onChange={(event) => setPreviewMode(event.target.value as PreviewMode)}>
          <option value="live">Editor + Preview</option>
          <option value="edit">Editor only</option>
          <option value="preview">Preview only</option>
        </select>
      </label>
      <button className={styles.secondaryButton} type="button" onClick={() => uploadRef.current?.click()}>
        Upload image
      </button>
      <button className={styles.secondaryButton} type="button" onClick={() => setFullscreenEditor((current) => !current)}>
        {fullscreenEditor ? 'Exit full page' : 'Full page editor'}
      </button>
    </div>
  )

  const visualEditor = (
    <div className={styles.editorBody}>
      <SimpleMDE
        value={editor.content}
        onChange={handleEditorChange}
        getMdeInstance={handleMdeInstance}
        options={editorOptions}
      />
    </div>
  )

  const renderedPreview = <article ref={previewRef} className={styles.previewPane} dangerouslySetInnerHTML={{ __html: previewHtml }} />

  const markdownEditor = (
    <div className={fullscreenEditor ? styles.fullscreenEditorBody : styles.editorBodyWrap}>
      {previewMode === 'edit' && visualEditor}
      {previewMode === 'preview' && renderedPreview}
      {previewMode === 'live' && (
        <div className={styles.richEditorGrid}>
          {visualEditor}
          {renderedPreview}
        </div>
      )}
    </div>
  )

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

      <div className={`${styles.grid} ${fullscreenEditor ? styles.gridFullscreen : ''}`}>
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
              {editorActions}
              <input ref={uploadRef} className={styles.hiddenInput} type="file" accept="image/*" onChange={uploadImage} />
            </div>

            <div className={styles.editorHeader}>
              <strong>Markdown editor</strong>
              <span>{previewMode === 'live' ? 'Split editor and preview' : previewMode === 'edit' ? 'Editor only' : 'Preview only'}</span>
            </div>
            {!fullscreenEditor && markdownEditor}
          </form>
        </section>
      </div>

      {fullscreenEditor && (
        <div className={styles.fullscreenEditor}>
          <div className={styles.fullscreenEditorTopbar}>
            <div>
              <strong>{editor.frontmatter.title || 'Untitled post'}</strong>
              <span>{editor.locale} / {editor.frontmatter.slug || 'new-post'}</span>
            </div>
            <div className={styles.fullscreenActions}>
              <button type="button" onClick={saveCurrentPost}>
                Save post
              </button>
              <button type="button" onClick={() => uploadRef.current?.click()}>
                Upload image
              </button>
              <button type="button" onClick={() => setFullscreenEditor(false)}>
                Exit full page
              </button>
            </div>
          </div>
          {markdownEditor}
        </div>
      )}
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
