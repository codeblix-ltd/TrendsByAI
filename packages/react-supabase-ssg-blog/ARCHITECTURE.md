# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEO_External_Platform                        │
│                                                                 │
│  • Content Generation                                           │
│  • Image Generation                                             │
│  • SEO Analysis                                                 │
│  • Schema Generation                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ 1. Upload Images
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│              Supabase Storage (article-images)                  │
│                                                                 │
│  • Stores all article images                                    │
│  • Public CDN access                                            │
│  • Returns public URLs                                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ 2. Get Image URLs
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│              Supabase Database (blog_articles)                  │
│                                                                 │
│  • Stores article data                                          │
│  • Image URLs (not base64)                                      │
│  • AEO schema, scores, links                                    │
│  • Row Level Security                                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ 3. Fetch Article Data
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│           react-supabase-ssg-blog Package                       │
│                                                                 │
│  • BlogIndex Component                                          │
│  • BlogArticle Component                                        │
│  • BlogService                                                  │
│  • SSG Helpers                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ 4. Render Article
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                    User's Browser                               │
│                                                                 │
│  • SEO-optimized HTML                                           │
│  • JSON-LD schema                                               │
│  • Images with alt text                                         │
│  • Internal links                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Publishing Flow

```
SEO Platform
    ↓
    ├─→ Generate Content
    │   ├─ Title, intro, sections
    │   ├─ Direct answer
    │   ├─ AEO schema
    │   └─ Internal links
    │
    ├─→ Generate/Fetch Images
    │   ├─ Featured image
    │   └─ Section images
    │
    ├─→ Upload to Supabase Storage
    │   ├─ Upload each image
    │   ├─ Get public URLs
    │   └─ Store URLs with alt text
    │
    └─→ Insert to Database
        ├─ Article metadata
        ├─ Image URLs (not base64)
        ├─ AEO schema
        ├─ Content scores
        └─ Internal links
```

### Rendering Flow

```
User visits /blog/article-slug
    ↓
BlogArticle Component
    ↓
    ├─→ Fetch from Supabase
    │   └─ Get article data
    │
    ├─→ Update Document Head
    │   ├─ Title
    │   ├─ Meta description
    │   ├─ Meta keywords
    │   └─ JSON-LD schema
    │
    └─→ Render Article
        ├─ Direct answer box
        ├─ Introduction
        ├─ Sections with images
        ├─ Internal links
        └─ Tags
```

## Component Architecture

### BlogIndex Component

```
BlogIndex
    │
    ├─→ BlogService.getArticlesPaginated()
    │   └─ Fetch articles from Supabase
    │
    └─→ Render
        ├─ Article cards
        │   ├─ Featured image
        │   ├─ Title
        │   ├─ Excerpt
        │   ├─ Author, date
        │   └─ Tags
        │
        └─ Pagination controls
```

### BlogArticle Component

```
BlogArticle
    │
    ├─→ BlogService.getArticleBySlug()
    │   └─ Fetch single article
    │
    ├─→ Update Document Head
    │   ├─ Meta tags
    │   └─ JSON-LD schema
    │
    ├─→ Increment Views
    │   └─ BlogService.incrementViews()
    │
    └─→ Render
        ├─ Header
        │   ├─ Title
        │   ├─ Author, date
        │   └─ Read time, views
        │
        ├─ Featured Image
        │   └─ With alt text
        │
        ├─ Direct Answer Box
        │   └─ AEO optimization
        │
        ├─ Introduction
        │   └─ HTML content
        │
        ├─ Sections
        │   └─ For each section:
        │       ├─ Heading (H2)
        │       ├─ Section image
        │       │   ├─ Image with alt text
        │       │   └─ Caption
        │       └─ Content (HTML)
        │
        ├─ Internal Links
        │   └─ Related articles
        │
        └─ Tags
```

## Database Schema

### blog_articles Table

```
blog_articles
├─ id (UUID, PK)
├─ slug (TEXT, UNIQUE)
├─ title (TEXT)
├─ content (TEXT)
├─ excerpt (TEXT)
├─ author (TEXT)
├─ author_id (UUID, FK)
│
├─ Images (URLs only)
│  ├─ featured_image (TEXT)
│  └─ featured_image_alt (TEXT)
│
├─ Timestamps
│  ├─ published_at (TIMESTAMPTZ)
│  ├─ updated_at (TIMESTAMPTZ)
│  └─ created_at (TIMESTAMPTZ)
│
├─ Status & Categories
│  ├─ status (TEXT)
│  ├─ tags (TEXT[])
│  └─ category (TEXT)
│
├─ SEO Metadata
│  ├─ meta_title (TEXT)
│  ├─ meta_description (TEXT)
│  └─ meta_keywords (TEXT[])
│
├─ Metrics
│  ├─ read_time (INTEGER)
│  └─ views (INTEGER)
│
└─ SEO Platform Fields
   ├─ intro (TEXT)
   ├─ direct_answer (TEXT)
   ├─ sections (JSONB)
   ├─ image_prompts (JSONB)
   ├─ aeo_schema (JSONB)
   ├─ content_score (JSONB)
   └─ internal_links (JSONB)
```

## TypeScript Type Hierarchy

```
BlogArticle (main interface)
    │
    ├─→ ArticleSection[]
    │   └─ { heading, content }
    │
    ├─→ ImagePrompt[]
    │   └─ { imageUrl, altText, prompt, status, sectionHeading }
    │
    ├─→ FeaturedImage
    │   └─ { imageUrl, altText, prompt? }
    │
    ├─→ InternalLink[]
    │   └─ { targetUrl, anchorText, justification }
    │
    ├─→ ContentScore
    │   └─ { overall, aeo, keywords, structure, readability }
    │
    └─→ AEOSchema
        └─ { @type, ...properties }
```

## Service Layer

### BlogService

```
BlogService
    │
    ├─→ constructor(supabaseClient, tableName, useMockData)
    │
    ├─→ getAllArticles()
    │   └─ Fetch all published articles
    │
    ├─→ getArticleBySlug(slug)
    │   └─ Fetch single article
    │
    ├─→ getArticlesPaginated(page, perPage)
    │   └─ Fetch paginated articles
    │
    ├─→ getAllSlugs()
    │   └─ For SSG path generation
    │
    └─→ incrementViews(slug)
        └─ Update view count
```

## Security Architecture

### Row Level Security (RLS)

```
Public Users
    └─→ Can read published articles only

Authenticated Users
    ├─→ Can read their own drafts
    ├─→ Can create articles
    ├─→ Can update their own articles
    └─→ Can delete their own articles

Storage Policies
    ├─→ Anyone can read images
    └─→ Authenticated users can upload/update/delete
```

## SEO Architecture

### Meta Tags

```
Document Head
    │
    ├─→ <title>
    │   └─ Article title
    │
    ├─→ <meta name="description">
    │   └─ Article excerpt or meta_description
    │
    ├─→ <meta name="keywords">
    │   └─ Article tags
    │
    ├─→ Open Graph Tags
    │   ├─ og:title
    │   ├─ og:description
    │   ├─ og:image
    │   └─ og:url
    │
    ├─→ Twitter Card Tags
    │   ├─ twitter:card
    │   ├─ twitter:title
    │   ├─ twitter:description
    │   └─ twitter:image
    │
    └─→ JSON-LD Schema
        └─ <script type="application/ld+json">
            └─ AEO schema (FAQ, HowTo, etc.)
```

### Image SEO

```
Every Image
    │
    ├─→ src (URL from Supabase Storage)
    ├─→ alt (descriptive alt text)
    ├─→ loading="lazy" (performance)
    └─→ Served from CDN (fast delivery)
```

## Performance Architecture

### Optimization Strategies

```
Database
    ├─→ Indexes on slug, status, published_at
    ├─→ GIN index on tags
    └─→ Pagination for large datasets

Images
    ├─→ Stored in Supabase Storage
    ├─→ Served from CDN
    ├─→ Lazy loading
    └─→ Image transformations available

Rendering
    ├─→ Static Site Generation (optional)
    ├─→ Client-side caching
    └─→ Minimal bundle size
```

## Deployment Architecture

### Static Site Generation

```
Build Time
    │
    ├─→ Fetch all article slugs
    │   └─ getBlogPaths()
    │
    ├─→ Pre-render each article
    │   └─ react-snap
    │
    └─→ Generate static HTML
        ├─ /blog/index.html
        ├─ /blog/article-1/index.html
        └─ /blog/article-2/index.html

Runtime
    │
    ├─→ Serve static HTML (instant load)
    ├─→ Hydrate with React (interactivity)
    └─→ Full SPA experience
```

## Integration Points

### SEO Platform → Supabase

```
SEO Platform
    │
    ├─→ Supabase Storage API
    │   └─ Upload images
    │
    └─→ Supabase Database API
        └─ Insert article data
```

### Blog Package → Supabase

```
Blog Package
    │
    ├─→ Supabase Client
    │   ├─ Query articles
    │   ├─ Increment views
    │   └─ Fetch images
    │
    └─→ Storage URLs
        └─ Display images
```

## Scalability

### Horizontal Scaling

```
Supabase
    ├─→ PostgreSQL (auto-scaling)
    ├─→ Storage (CDN distribution)
    └─→ API (load balanced)

Frontend
    ├─→ Static files (CDN)
    ├─→ No server required
    └─→ Infinite scale
```

## Monitoring & Analytics

### Metrics Tracked

```
Article Level
    ├─→ Views (database)
    ├─→ Read time (calculated)
    └─→ Content score (from SEO platform)

System Level
    ├─→ Page load time
    ├─→ Image load time
    └─→ API response time
```

## Future Enhancements

### Planned Features

```
Content
    ├─→ Comments system
    ├─→ Related posts
    └─→ Search functionality

SEO
    ├─→ Sitemap generation
    ├─→ RSS feed
    └─→ Social sharing

Analytics
    ├─→ Google Analytics integration
    ├─→ Content score display
    └─→ Performance dashboard
```

## Summary

The architecture is designed for:
- **Performance**: CDN, lazy loading, SSG
- **SEO**: Structured data, meta tags, alt text
- **Scalability**: Serverless, static files
- **Security**: RLS, storage policies
- **Maintainability**: Clean separation, TypeScript
- **Integration**: Direct Supabase publishing

All components work together to provide a production-ready, SEO-optimized blog system that integrates seamlessly with the SEO_External_Platform.

