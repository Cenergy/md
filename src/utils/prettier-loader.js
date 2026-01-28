// Import Prettier and plugins
import '@/lib/prettier/standalone.js'
import '@/lib/prettier/acorn.js'
import '@/lib/prettier/babel.js'
import '@/lib/prettier/estree.js'
import '@/lib/prettier/html.js'
import '@/lib/prettier/markdown.js'
import '@/lib/prettier/postcss.js'
import '@/lib/prettier/typescript.js'

// Ensure global access
if (typeof window !== 'undefined') {
    // Prettier usually attaches itself to window.prettier
    // Plugins usually attach themselves to window.prettierPlugins
}
