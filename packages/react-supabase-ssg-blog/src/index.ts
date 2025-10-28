/**
 * React Supabase SSG Blog
 * A reusable npm package for adding SEO-friendly blog functionality to React applications
 *
 * @packageDocumentation
 */

// Export styles (users can import this in their main app)
import './styles/index.css';

// Export components
export { BlogArticle } from './components/BlogArticle';
export { BlogIndex } from './components/BlogIndex';

// Export services
export { BlogService } from './services/blogService';

// Export utilities
export {
  getBlogPaths,
  generateBlogSitemap,
  generateSitemapXML,
  generateMetaTags,
  calculateReadTime,
  formatDate,
  generateExcerpt,
  sanitizeSlug,
  validateArticle
} from './utils/ssgHelpers';

// Export types
export type {
  BlogArticle as BlogArticleType,
  BlogMetadata,
  BlogConfig,
  BlogIndexProps,
  BlogArticleProps,
  BlogServiceResponse,
  PaginationInfo,
  BlogListResponse
} from './types';

