
## 🧩 **Tecnologia utilitzada**

-   **Next.js**: framework per React amb suport SSR i estàtic
    
-   **next-i18next**: internacionalització amb traduccions basades en fitxers
    
-   **MDX**: format Markdown + JSX per a contingut flexible
    
-   **gray-matter**: per extreure frontmatter (`title`, `date`, etc.) dels `.mdx`
    
-   **React** i **TypeScript**
    

----------

## 🌍 **Estructura multilingüe**

### 🗂️ Carpeta `posts/` amb idiomes:

markdown

CopiaModifica

`posts/
├── ca/
│   └── welcome.mdx
├── es/
│   └── welcome.mdx
└── en/
 └── welcome.mdx` 

### 🌐 Traductors (`public/locales/`)

-   `common.json` amb claus com:
    
    -   `welcome`, `read_more`, `category`, `change_language`, `no_posts`, `blog`
        

----------

## 🛣️ **Routing**

Ruta

Funció

`/ca/blog`

Llista posts en català

`/es/blog`

Llista posts en castellà

`/en/blog`

Llista posts en anglès

`/ca/blog/welcome`

Post en català (o fallback)

`/es/category/general`

Posts filtrats per categoria

----------

## 🧠 **Funcions avançades**

-   ✅ **Fallback automàtic** si un `.mdx` no existeix en l’idioma actual
    
-   ✅ **Traduccions completament configurades**
    
-   ✅ **Secció de blog separada (`/blog`)**
    
-   ✅ **Índex de blog amb posts filtrats per idioma**
    

----------

## 🧪 Punts a millorar o ampliar (futur)

-   🔍 Cerca multilingüe
    
-   🧵 Etiquetes (tags) i filtratge
    
-   🗂️ Categories jeràrquiques
    
-   📤 Formulari d’enviament de nous articles
    
-   🔄 Connexió amb CMS Headless (Strapi, Sanity...)
-   


## HOW TO DEVELOP
export NODE_ENV=development
export NEXT_PUBLIC_GTM_ID=XXX-XXXXX
export NEXT_PUBLIC_GTM_ID=GTM-KTG8N34J
npm run dev


## HOW TO DEPLOY
export NODE_ENV=production
export NEXT_PUBLIC_GTM_ID=GTM-KTG8N34J
npm run build
npm run start-server