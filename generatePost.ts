import fs from 'fs'
import path from 'path'

const title = 'Post generat automàticament'
const slug = 'post-automatic'
const link = 'https://amazon.com/producte-genial'

const content = `---
title: "${title}"
date: "${new Date().toISOString()}"
productLink: "${link}"
---

Aquest post ha estat generat per un script 🧠

👉 [Producte recomanat](${link})
`

fs.writeFileSync(path.join('posts', `${slug}.mdx`), content)
