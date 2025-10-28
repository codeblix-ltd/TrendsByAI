import type { BlogArticle } from '../types';

/**
 * Generate blog paths for Static Site Generation
 * This function should be called during the build process to discover all blog routes
 * 
 * @param supabaseClient - Supabase client instance
 * @param tableName - Name of the blog articles table (default: 'blog_articles')
 * @param basePath - Base path for blog routes (default: '/blog')
 * @returns Array of paths to pre-render
 */
export async function getBlogPaths(
  supabaseClient: any,
  tableName: string = 'blog_articles',
  basePath: string = '/blog'
): Promise<string[]> {
  try {
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('slug')
      .eq('status', 'published');

    if (error) {
      console.error('Error fetching blog paths:', error);
      return [];
    }

    // Generate paths for each article
    const articlePaths = data?.map((article: any) => `${basePath}/${article.slug}`) || [];
    
    // Include the main blog index page
    return [basePath, ...articlePaths];
  } catch (error) {
    console.error('Error in getBlogPaths:', error);
    return [];
  }
}

/**
 * Generate sitemap entries for blog articles
 * Useful for creating sitemap.xml
 *
 * @param supabaseClient - Supabase client instance
 * @param baseUrl - Base URL of your site (e.g., 'https://example.com')
 * @param tableName - Name of the blog articles table
 * @returns Array of sitemap entries
 */
export async function generateBlogSitemap(
  supabaseClient: any,
  baseUrl: string,
  tableName: string = 'blog_articles'
): Promise<Array<{ url: string; lastmod: string; changefreq: string; priority: number }>> {
  try {
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error generating sitemap:', error);
      return [];
    }

    return data?.map((article: any) => ({
      url: `${baseUrl}/blog/${article.slug}`,
      lastmod: article.updated_at || article.published_at,
      changefreq: 'weekly',
      priority: 0.8
    })) || [];
  } catch (error) {
    console.error('Error in generateBlogSitemap:', error);
    return [];
  }
}

/**
 * Generate XML sitemap for blog articles
 * Creates a complete sitemap.xml file content
 *
 * @param supabaseClient - Supabase client instance
 * @param baseUrl - Base URL of your site (e.g., 'https://example.com')
 * @param tableName - Name of the blog articles table
 * @param includeIndexPage - Include the blog index page in sitemap (default: true)
 * @returns XML sitemap string
 */
export async function generateSitemapXML(
  supabaseClient: any,
  baseUrl: string,
  tableName: string = 'blog_articles',
  includeIndexPage: boolean = true
): Promise<string> {
  try {
    const entries = await generateBlogSitemap(supabaseClient, baseUrl, tableName);

    // Start XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add blog index page
    if (includeIndexPage) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/blog</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>1.0</priority>\n`;
      xml += '  </url>\n';
    }

    // Add article pages
    for (const entry of entries) {
      xml += '  <url>\n';
      xml += `    <loc>${escapeXml(entry.url)}</loc>\n`;
      xml += `    <lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>\n`;
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      xml += `    <priority>${entry.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    // Close XML
    xml += '</urlset>';

    return xml;
  } catch (error) {
    console.error('Error generating sitemap XML:', error);
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
  }
}

/**
 * Escape XML special characters
 * @param str - String to escape
 * @returns Escaped string
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate meta tags for SEO
 * 
 * @param article - Blog article data
 * @param baseUrl - Base URL of your site
 * @returns Object containing meta tags
 */
export function generateMetaTags(article: BlogArticle, baseUrl?: string) {
  const url = baseUrl ? `${baseUrl}/blog/${article.slug}` : undefined;
  
  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt || '',
    keywords: article.meta_keywords?.join(', ') || article.tags?.join(', ') || '',
    author: article.author || '',
    publishedTime: article.published_at,
    modifiedTime: article.updated_at || article.published_at,
    image: article.featured_image || '',
    url: url || '',
    type: 'article',
    
    // Open Graph tags
    og: {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt || '',
      image: article.featured_image || '',
      url: url || '',
      type: 'article',
      siteName: '',
      publishedTime: article.published_at,
      modifiedTime: article.updated_at || article.published_at,
      author: article.author || '',
      tags: article.tags || []
    },
    
    // Twitter Card tags
    twitter: {
      card: 'summary_large_image',
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt || '',
      image: article.featured_image || '',
      creator: article.author || ''
    }
  };
}

/**
 * Calculate estimated reading time
 * 
 * @param content - Article content (HTML or plain text)
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Estimated reading time in minutes
 */
export function calculateReadTime(content: string, wordsPerMinute: number = 200): number {
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // Count words
  const words = plainText.trim().split(/\s+/).length;
  
  // Calculate reading time
  const minutes = Math.ceil(words / wordsPerMinute);
  
  return minutes;
}

/**
 * Format date for display
 * 
 * @param dateString - ISO date string
 * @param format - Format type ('short', 'long', 'relative')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, format: 'short' | 'long' | 'relative' = 'long'): string {
  const date = new Date(dateString);
  const now = new Date();
  
  if (format === 'relative') {
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
  
  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  // long format
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Generate excerpt from content
 * 
 * @param content - Full article content
 * @param maxLength - Maximum length of excerpt (default: 160)
 * @returns Excerpt string
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  const cleaned = plainText.replace(/\s+/g, ' ').trim();
  
  // Truncate to maxLength
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  
  // Find the last space before maxLength
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + '...';
}

/**
 * Sanitize slug for URL
 * 
 * @param text - Text to convert to slug
 * @returns URL-safe slug
 */
export function sanitizeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validate article data
 * 
 * @param article - Article data to validate
 * @returns Object with isValid flag and errors array
 */
export function validateArticle(article: Partial<BlogArticle>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!article.title || article.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!article.slug || article.slug.trim().length === 0) {
    errors.push('Slug is required');
  }
  
  if (!article.content || article.content.trim().length === 0) {
    errors.push('Content is required');
  }
  
  if (!article.published_at) {
    errors.push('Published date is required');
  }
  
  if (!article.status || !['draft', 'published', 'archived'].includes(article.status)) {
    errors.push('Valid status is required (draft, published, or archived)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

