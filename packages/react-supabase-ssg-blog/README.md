# React Supabase SSG Blog

A reusable React package for adding SEO-friendly blog functionality to any React application with Supabase backend and Static Site Generation (SSG) support.

## 🚀 Features

- ✅ **SEO-Friendly**: Pre-rendered static HTML pages for better search engine indexing
- ✅ **Supabase Backend**: Powerful PostgreSQL database with real-time capabilities
- ✅ **TypeScript Support**: Fully typed for better developer experience
- ✅ **Responsive Design**: Mobile-first, responsive blog components
- ✅ **Easy Integration**: Drop-in components for React applications
- ✅ **Customizable**: Flexible props for styling and behavior
- ✅ **Pagination**: Built-in pagination for blog listings
- ✅ **Tags & Categories**: Organize content with tags and categories
- ✅ **View Tracking**: Track article views automatically
- ✅ **Mock Data**: Development mode with mock data for testing
- ✅ **SEO Platform Integration**: Compatible with SEO_External_Platform for automated publishing
- ✅ **AEO Optimization**: Answer Engine Optimization with structured data (FAQ, HowTo schemas)
- ✅ **Image Management**: All images stored as URLs in Supabase Storage with alt text
- ✅ **Content Sections**: Structured content with sections and inline images
- ✅ **Internal Linking**: Automatic internal link suggestions and rendering
- ✅ **Sitemap Generation**: Automatic sitemap.xml generation for SEO

## 📦 Installation

```bash
npm install react-supabase-ssg-blog @supabase/supabase-js react-router-dom
```

### Peer Dependencies

This package requires the following peer dependencies:

- `react` ^18.0.0
- `react-dom` ^18.0.0
- `react-router-dom` ^6.0.0
- `@supabase/supabase-js` ^2.0.0

### Import Default Styles

The package includes beautiful default styles for blog articles. Import them in your main app file:

```tsx
// In your main App.tsx or index.tsx
import 'react-supabase-ssg-blog/src/styles/index.css';
```

**Or** import specific stylesheets:

```tsx
// Just article styles
import 'react-supabase-ssg-blog/src/styles/blog-article.css';

// Just index/list styles
import 'react-supabase-ssg-blog/src/styles/blog-index.css';
```

The default styles provide:
- ✨ Beautiful typography for all HTML elements (h1-h6, p, ul, ol, table, blockquote, etc.)
- 📱 Responsive design for mobile and desktop
- 🎨 Professional color scheme and spacing
- 🔗 Styled links, code blocks, and tables
- 📖 Optimized for readability

**Customization**: You can override any styles by adding your own CSS after importing the default styles.

## 🛠️ Setup

### 1. Database Setup

Run the SQL scripts in your Supabase SQL Editor:

1. First, run `database-setup.sql` to create the `blog_articles` table with all SEO platform fields
2. Optionally, run `sample-data-seo-platform.sql` to insert sample blog posts with full SEO integration

The database schema includes:
- Blog articles table with full-text search support
- Row Level Security (RLS) policies
- Automatic timestamp updates
- View counting functionality
- Indexes for optimal performance
- SEO Platform fields (sections, AEO schema, content scores, internal links)
- Image storage integration with Supabase Storage

### 2. Supabase Client Configuration

Create a Supabase client in your application:

```typescript
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📖 Usage

### Basic Setup

Add blog routes to your React Router configuration:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BlogIndex, BlogArticle } from 'react-supabase-ssg-blog';
import { supabase } from './lib/supabaseClient';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Blog listing page */}
        <Route 
          path="/blog" 
          element={
            <BlogIndex 
              supabaseClient={supabase}
              basePath="/blog"
              postsPerPage={10}
            />
          } 
        />
        
        {/* Individual blog post page */}
        <Route 
          path="/blog/:slug" 
          element={
            <BlogArticle 
              supabaseClient={supabase}
              basePath="/blog"
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### Development Mode (Mock Data)

For development without a Supabase connection, omit the `supabaseClient` prop:

```typescript
<BlogIndex basePath="/blog" postsPerPage={10} />
```

The package will automatically use mock data when no Supabase client is provided.

## 🎨 Component API

### BlogIndex

Displays a paginated list of blog articles.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `supabaseClient` | `SupabaseClient` | `undefined` | Supabase client instance (optional for dev mode) |
| `basePath` | `string` | `'/blog'` | Base path for blog routes |
| `postsPerPage` | `number` | `10` | Number of posts per page |
| `showExcerpt` | `boolean` | `true` | Show article excerpts |
| `showAuthor` | `boolean` | `true` | Show article authors |
| `showDate` | `boolean` | `true` | Show publication dates |
| `showTags` | `boolean` | `true` | Show article tags |
| `className` | `string` | `''` | Additional CSS classes |
| `onArticleClick` | `(article) => void` | `undefined` | Custom click handler |

### BlogArticle

Displays a single blog article with SEO meta tags.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `supabaseClient` | `SupabaseClient` | `undefined` | Supabase client instance (optional for dev mode) |
| `slug` | `string` | `undefined` | Article slug (uses URL param if not provided) |
| `basePath` | `string` | `'/blog'` | Base path for blog routes |
| `showAuthor` | `boolean` | `true` | Show article author |
| `showDate` | `boolean` | `true` | Show publication date |
| `showTags` | `boolean` | `true` | Show article tags |
| `showRelatedPosts` | `boolean` | `false` | Show related posts (future feature) |
| `className` | `string` | `''` | Additional CSS classes |
| `onBack` | `() => void` | `undefined` | Custom back button handler |

## 🔧 Utility Functions

### getBlogPaths

Generate blog paths for Static Site Generation:

```typescript
import { getBlogPaths } from 'react-supabase-ssg-blog';
import { supabase } from './lib/supabaseClient';

const paths = await getBlogPaths(supabase, 'blog_articles', '/blog');
// Returns: ['/blog', '/blog/article-1', '/blog/article-2', ...]
```

### generateMetaTags

Generate SEO meta tags for an article:

```typescript
import { generateMetaTags } from 'react-supabase-ssg-blog';

const metaTags = generateMetaTags(article, 'https://example.com');
// Returns: { title, description, keywords, og, twitter, ... }
```

### Other Utilities

- `calculateReadTime(content, wordsPerMinute)` - Calculate reading time
- `formatDate(dateString, format)` - Format dates
- `generateExcerpt(content, maxLength)` - Generate excerpts
- `sanitizeSlug(text)` - Create URL-safe slugs
- `validateArticle(article)` - Validate article data

## 🎯 Static Site Generation (SSG)

This package includes **automatic static HTML generation** using Puppeteer for perfect SEO on shared hosting!

### ✨ Features

- ✅ Generates static HTML for all blog routes at build time
- ✅ Perfect for shared hosting (no Node.js server needed)
- ✅ Fully automated - runs during `npm run build`
- ✅ Includes all SEO meta tags in static HTML
- ✅ Fast loading + React hydration for interactivity

### 🚀 Quick Setup

#### 1. Install Dependencies

```bash
npm install --save-dev puppeteer serve-handler
```

#### 2. Add Scripts to package.json

```json
{
  "scripts": {
    "build": "npm run generate-sitemap && vite build && npm run copy-htaccess && npm run prerender",
    "generate-sitemap": "node packages/react-supabase-ssg-blog/scripts/generate-sitemap.cjs",
    "prerender": "node packages/react-supabase-ssg-blog/scripts/prerender.cjs",
    "copy-htaccess": "node -e \"require('fs').copyFileSync('public/.htaccess', 'dist/.htaccess')\""
  }
}
```

#### 3. Build Your Site

```bash
npm run build
```

That's it! Your blog routes are now static HTML files in `/dist/blog/`.

### 📁 Generated Structure

```
dist/
├── blog/
│   ├── index.html                    # Static /blog page
│   ├── article-slug-1/
│   │   └── index.html               # Static article page
│   └── article-slug-2/
│       └── index.html               # Static article page
├── sitemap.xml                      # Auto-generated sitemap
└── prerender-summary.json           # Build report
```

### 📚 Full Documentation

See [SSG_SETUP.md](./SSG_SETUP.md) for:
- Detailed configuration options
- Troubleshooting guide
- Performance optimization
- Deployment instructions
- Advanced usage examples

### 🔍 How It Works

1. **Build Time**: Puppeteer launches headless Chrome
2. **Rendering**: Visits each blog route and waits for React to render
3. **Capture**: Saves fully rendered HTML with all meta tags
4. **Deploy**: Upload `/dist` to any shared hosting

### ✅ SEO Benefits

Each static HTML file includes:
- Complete article content (visible to search engines)
- Meta title and description tags
- Open Graph tags for social sharing
- Twitter Card tags
- Structured data (JSON-LD)
- Fast loading times (instant HTML)

## 🗺️ Sitemap Generation

The package includes automatic sitemap.xml generation for SEO.

### Setup Sitemap Generation

1. **Create the script** (already included in the examples folder):

```javascript
// scripts/generate-sitemap.cjs
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function generateSitemap() {
  const supabase = createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_SUPABASE_ANON_KEY'
  );

  const baseUrl = 'https://yourdomain.com';

  // Fetch published articles
  const { data: articles } = await supabase
    .from('blog_articles')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add blog index
  xml += '  <url>\n';
  xml += `    <loc>${baseUrl}/blog</loc>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>0.9</priority>\n`;
  xml += '  </url>\n';

  // Add articles
  for (const article of articles) {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/blog/${article.slug}</loc>\n`;
    xml += `    <lastmod>${new Date(article.updated_at || article.published_at).toISOString()}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>';

  // Write to public/sitemap.xml
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), xml, 'utf8');
  console.log('✅ Sitemap generated successfully');
}

generateSitemap();
```

2. **Add to package.json**:

```json
{
  "scripts": {
    "generate-sitemap": "node scripts/generate-sitemap.cjs",
    "build": "npm run generate-sitemap && vite build"
  }
}
```

3. **The sitemap will be available at**: `https://yourdomain.com/sitemap.xml`

### Using the Package Utility

Alternatively, use the built-in `generateSitemapXML` utility:

```typescript
import { generateSitemapXML } from 'react-supabase-ssg-blog';
import { supabase } from './lib/supabaseClient';

const sitemapXML = await generateSitemapXML(
  supabase,
  'https://yourdomain.com',
  'blog_articles', // table name
  true // include blog index page
);

// Write to file or serve via API endpoint
```

See `examples/sitemap-endpoint.ts` for Express.js and Next.js examples.

## 🔄 Keeping Content Fresh

For new blog posts to be indexed by search engines, you must rebuild and redeploy your application.

### Automated Rebuilds with Webhooks

Set up a webhook to trigger rebuilds when new content is published:

1. **Supabase Database Webhook**: Create a database function that calls your deployment webhook
2. **Deployment Platform**: Configure your hosting (Netlify, Vercel, etc.) to accept webhook triggers
3. **Automatic Builds**: New articles trigger automatic rebuilds

Example Supabase function:

```sql
CREATE OR REPLACE FUNCTION notify_new_article()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://api.netlify.com/build_hooks/your-hook-id',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_article
AFTER INSERT ON blog_articles
FOR EACH ROW
WHEN (NEW.status = 'published')
EXECUTE FUNCTION notify_new_article();
```

## 📝 TypeScript Support

This package is written in TypeScript and exports all necessary types:

```typescript
import type { 
  BlogArticleType,
  BlogMetadata,
  BlogConfig,
  BlogIndexProps,
  BlogArticleProps 
} from 'react-supabase-ssg-blog';
```

## 🎨 Styling

The components use Tailwind CSS classes by default. You can:

1. **Use Tailwind**: The components work out-of-the-box with Tailwind CSS
2. **Custom Classes**: Pass `className` prop to add your own styles
3. **Override Styles**: Use CSS specificity to override default styles

## 🔗 SEO Platform Integration

This package is fully compatible with the SEO_External_Platform for automated content publishing.

### Key Features

- **Direct Supabase Integration**: SEO platform can publish directly to your database
- **Image Storage**: All images stored as URLs in Supabase Storage (never base64)
- **AEO Optimization**: Automatic rendering of FAQ and HowTo schemas
- **Content Sections**: Structured content with inline images
- **Internal Links**: Automatic internal link suggestions
- **Content Scores**: Quality metrics from SEO analysis

### Setup

1. Run `database-setup.sql` to create the table with all SEO platform fields
2. Run `sample-data-seo-platform.sql` to insert sample articles (optional)
3. Configure SEO platform with your Supabase credentials
4. Publish articles from the platform - they'll appear automatically!

### Documentation

See [SEO_PLATFORM_INTEGRATION.md](./SEO_PLATFORM_INTEGRATION.md) for complete integration guide.

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

## 🙏 Acknowledgments

- Built with React and TypeScript
- Powered by Supabase
- Inspired by modern SSG frameworks
- Integrated with SEO_External_Platform

