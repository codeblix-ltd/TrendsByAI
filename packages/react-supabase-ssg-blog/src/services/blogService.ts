import type { BlogArticle, BlogListResponse } from '../types';

/**
 * Mock blog articles for development and testing
 */
const mockArticles: BlogArticle[] = [
  {
    id: '1',
    slug: 'getting-started-with-react-ssg',
    title: 'Getting Started with React Static Site Generation',
    content: `
# Getting Started with React Static Site Generation

Static Site Generation (SSG) is a powerful technique for building fast, SEO-friendly websites. In this article, we'll explore how to implement SSG in your React applications.

## What is SSG?

Static Site Generation is the process of pre-rendering pages at build time, creating static HTML files that can be served directly to users. This approach offers several benefits:

- **Better SEO**: Search engines can easily crawl and index your content
- **Faster Load Times**: Pre-rendered HTML loads instantly
- **Lower Server Costs**: Static files are cheap to host and serve
- **Better Security**: No server-side code execution reduces attack surface

## How It Works

The SSG process involves:

1. Fetching data at build time
2. Rendering React components to HTML
3. Generating static files for each route
4. Deploying the static files to a CDN

## Implementation

To implement SSG in your React app, you'll need to use a tool like react-snap or a framework like Next.js. The key is to ensure all your dynamic routes are discovered and pre-rendered during the build process.

## Conclusion

SSG is an excellent choice for content-heavy sites like blogs, documentation, and marketing pages. It combines the developer experience of React with the performance and SEO benefits of static sites.
    `,
    excerpt: 'Learn how to implement Static Site Generation in your React applications for better SEO and performance.',
    author: 'John Doe',
    author_id: 'author-1',
    featured_image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    published_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    status: 'published',
    tags: ['React', 'SSG', 'SEO', 'Web Development'],
    category: 'Tutorial',
    meta_title: 'Getting Started with React SSG - Complete Guide',
    meta_description: 'A comprehensive guide to implementing Static Site Generation in React applications for improved SEO and performance.',
    meta_keywords: ['React', 'SSG', 'Static Site Generation', 'SEO', 'Performance'],
    read_time: 5,
    views: 1250
  },
  {
    id: '2',
    slug: 'supabase-backend-for-modern-apps',
    title: 'Using Supabase as Your Backend',
    content: `
# Using Supabase as Your Backend

Supabase is an open-source Firebase alternative that provides a complete backend solution for modern applications. Let's explore why it's becoming the go-to choice for developers.

## Why Supabase?

Supabase offers several compelling features:

- **PostgreSQL Database**: A powerful, reliable relational database
- **Real-time Subscriptions**: Listen to database changes in real-time
- **Authentication**: Built-in auth with multiple providers
- **Storage**: File storage with CDN delivery
- **Edge Functions**: Serverless functions at the edge

## Getting Started

Setting up Supabase is straightforward:

1. Create a project at supabase.com
2. Get your API keys
3. Install the client library
4. Start building!

## Database Design

Supabase uses PostgreSQL, which means you get all the power of a relational database. You can create tables, set up relationships, and write complex queries.

## Real-time Features

One of Supabase's killer features is real-time subscriptions. You can listen to INSERT, UPDATE, and DELETE events on your tables and update your UI instantly.

## Conclusion

Supabase provides a complete backend solution that's easy to use, powerful, and scalable. It's perfect for modern web applications.
    `,
    excerpt: 'Discover how Supabase can power your modern web applications with its comprehensive backend features.',
    author: 'Jane Smith',
    author_id: 'author-2',
    featured_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
    published_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    status: 'published',
    tags: ['Supabase', 'Backend', 'Database', 'PostgreSQL'],
    category: 'Backend',
    meta_title: 'Supabase Backend Guide - Modern App Development',
    meta_description: 'Learn how to use Supabase as a complete backend solution for your modern web applications.',
    meta_keywords: ['Supabase', 'Backend', 'PostgreSQL', 'Real-time', 'Authentication'],
    read_time: 7,
    views: 980
  },
  {
    id: '3',
    slug: 'optimizing-react-performance',
    title: 'Optimizing React Application Performance',
    content: `
# Optimizing React Application Performance

Performance is crucial for user experience. In this article, we'll cover essential techniques for optimizing your React applications.

## Key Performance Metrics

Understanding these metrics is the first step:

- **First Contentful Paint (FCP)**: When the first content appears
- **Largest Contentful Paint (LCP)**: When the main content loads
- **Time to Interactive (TTI)**: When the page becomes interactive
- **Cumulative Layout Shift (CLS)**: Visual stability

## Optimization Techniques

### 1. Code Splitting

Break your bundle into smaller chunks that load on demand:

\`\`\`javascript
const LazyComponent = React.lazy(() => import('./Component'));
\`\`\`

### 2. Memoization

Use React.memo, useMemo, and useCallback to prevent unnecessary re-renders:

\`\`\`javascript
const MemoizedComponent = React.memo(MyComponent);
\`\`\`

### 3. Virtual Scrolling

For long lists, render only visible items:

\`\`\`javascript
import { FixedSizeList } from 'react-window';
\`\`\`

### 4. Image Optimization

- Use modern formats (WebP, AVIF)
- Implement lazy loading
- Serve responsive images

## Measuring Performance

Use tools like:

- Chrome DevTools
- Lighthouse
- React DevTools Profiler
- Web Vitals library

## Conclusion

Performance optimization is an ongoing process. Start with measuring, identify bottlenecks, and apply targeted optimizations.
    `,
    excerpt: 'Essential techniques and best practices for optimizing the performance of your React applications.',
    author: 'Mike Johnson',
    author_id: 'author-3',
    featured_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
    published_at: '2024-01-25T09:15:00Z',
    updated_at: '2024-01-25T09:15:00Z',
    status: 'published',
    tags: ['React', 'Performance', 'Optimization', 'Web Vitals'],
    category: 'Performance',
    meta_title: 'React Performance Optimization - Complete Guide',
    meta_description: 'Learn essential techniques for optimizing React application performance and improving user experience.',
    meta_keywords: ['React', 'Performance', 'Optimization', 'Web Vitals', 'Code Splitting'],
    read_time: 8,
    views: 1540
  }
];

/**
 * Blog service for fetching articles
 * In development, uses mock data. In production, connects to Supabase.
 */
export class BlogService {
  private supabaseClient: any;
  private tableName: string;
  private useMockData: boolean;

  constructor(supabaseClient?: any, tableName: string = 'blog_articles', useMockData: boolean = false) {
    this.supabaseClient = supabaseClient;
    this.tableName = tableName;
    this.useMockData = useMockData || !supabaseClient;
  }

  /**
   * Get all published articles
   */
  async getAllArticles(): Promise<BlogArticle[]> {
    if (this.useMockData) {
      return mockArticles.filter(article => article.status === 'published');
    }

    try {
      const { data, error } = await this.supabaseClient
        .from(this.tableName)
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  }

  /**
   * Get article by slug
   */
  async getArticleBySlug(slug: string): Promise<BlogArticle | null> {
    if (this.useMockData) {
      return mockArticles.find(article => article.slug === slug && article.status === 'published') || null;
    }

    try {
      const { data, error } = await this.supabaseClient
        .from(this.tableName)
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  }

  /**
   * Get paginated articles
   */
  async getArticlesPaginated(page: number = 1, perPage: number = 10): Promise<BlogListResponse> {
    if (this.useMockData) {
      const published = mockArticles.filter(article => article.status === 'published');
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const articles = published.slice(start, end);
      
      return {
        articles,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(published.length / perPage),
          totalItems: published.length,
          itemsPerPage: perPage,
          hasNext: end < published.length,
          hasPrevious: page > 1
        }
      };
    }

    try {
      const start = (page - 1) * perPage;
      const end = start + perPage - 1;

      const { data, error, count } = await this.supabaseClient
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / perPage);

      return {
        articles: data || [],
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: perPage,
          hasNext: page < totalPages,
          hasPrevious: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching paginated articles:', error);
      return {
        articles: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: perPage,
          hasNext: false,
          hasPrevious: false
        }
      };
    }
  }

  /**
   * Get all article slugs (for SSG path generation)
   */
  async getAllSlugs(): Promise<string[]> {
    if (this.useMockData) {
      return mockArticles
        .filter(article => article.status === 'published')
        .map(article => article.slug);
    }

    try {
      const { data, error } = await this.supabaseClient
        .from(this.tableName)
        .select('slug')
        .eq('status', 'published');

      if (error) throw error;
      return data?.map((item: any) => item.slug) || [];
    } catch (error) {
      console.error('Error fetching slugs:', error);
      return [];
    }
  }

  /**
   * Increment view count for an article
   */
  async incrementViews(slug: string): Promise<void> {
    if (this.useMockData) {
      const article = mockArticles.find(a => a.slug === slug);
      if (article && article.views !== undefined) {
        article.views++;
      }
      return;
    }

    try {
      await this.supabaseClient.rpc('increment_article_views', { article_slug: slug });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }
}

export default BlogService;

