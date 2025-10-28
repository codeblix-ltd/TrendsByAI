/**
 * Core types for the React Supabase SSG Blog package
 * Compatible with SEO_External_Platform data structure
 */

/**
 * Article section with heading and content
 */
export interface ArticleSection {
  heading: string;
  content: string;
}

/**
 * Image prompt with URL, alt text, and section association
 * Images are always stored as URLs in Supabase Storage
 */
export interface ImagePrompt {
  prompt: string;
  status: 'done' | 'pending' | 'error';
  altText: string;
  imageUrl: string;
  sectionHeading: string;
}

/**
 * Featured image with URL and alt text
 */
export interface FeaturedImage {
  prompt?: string;
  altText: string;
  imageUrl: string;
}

/**
 * Internal link suggestion
 */
export interface InternalLink {
  targetUrl: string;
  anchorText: string;
  justification: string;
}

/**
 * Content score from SEO analysis
 */
export interface ContentScore {
  aeo?: {
    score: number;
    feedback: string;
  };
  overall?: number;
  keywords?: {
    score: number;
    feedback: string;
  };
  structure?: {
    score: number;
    feedback: string;
  };
  readability?: {
    score: number;
    feedback: string;
  };
}

/**
 * AEO Schema (Answer Engine Optimization)
 * Supports FAQPage, HowTo, and other schema types
 */
export interface AEOSchema {
  '@type': string;
  [key: string]: any;
}

/**
 * Represents a blog article in the database
 * Compatible with SEO_External_Platform JSON schema
 */
export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  author_id?: string;

  // Image fields (all URLs to Supabase Storage)
  featured_image?: string;
  featured_image_alt?: string;

  // Timestamps
  published_at: string;
  updated_at?: string;
  created_at?: string;

  // Status and categorization
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  category?: string;

  // SEO metadata
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];

  // Article metrics
  read_time?: number;
  views?: number;

  // SEO Platform Integration Fields
  intro?: string;
  direct_answer?: string;
  sections?: ArticleSection[];
  image_prompts?: ImagePrompt[];
  aeo_schema?: AEOSchema;
  content_score?: ContentScore;
  internal_links?: InternalLink[];
}

/**
 * Metadata for SEO purposes
 */
export interface BlogMetadata {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
  url?: string;
}

/**
 * Configuration for the blog module
 */
export interface BlogConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  tableName?: string;
  basePath?: string;
  postsPerPage?: number;
  enableComments?: boolean;
  dateFormat?: string;
}

/**
 * Props for BlogIndex component
 */
export interface BlogIndexProps {
  supabaseClient?: any;
  basePath?: string;
  postsPerPage?: number;
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
  showTags?: boolean;
  className?: string;
  onArticleClick?: (article: BlogArticle) => void;
}

/**
 * Props for BlogArticle component
 */
export interface BlogArticleProps {
  supabaseClient?: any;
  slug?: string;
  basePath?: string;
  showAuthor?: boolean;
  showDate?: boolean;
  showTags?: boolean;
  showRelatedPosts?: boolean;
  className?: string;
  onBack?: () => void;
}

/**
 * Response from blog service
 */
export interface BlogServiceResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

/**
 * Pagination info
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Blog list response with pagination
 */
export interface BlogListResponse {
  articles: BlogArticle[];
  pagination: PaginationInfo;
}

