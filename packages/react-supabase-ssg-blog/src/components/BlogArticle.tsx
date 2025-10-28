import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { BlogArticle as BlogArticleType, BlogArticleProps } from '../types';
import { BlogService } from '../services/blogService';
import { generateMetaTags, formatDate, calculateReadTime } from '../utils/ssgHelpers';

/**
 * BlogArticle Component
 * Displays a single blog article with SEO meta tags
 */
export const BlogArticle: React.FC<BlogArticleProps> = ({
  supabaseClient,
  slug: propSlug,
  basePath = '/blog',
  showAuthor = true,
  showDate = true,
  showTags = true,
  showRelatedPosts: _showRelatedPosts = false,
  className = '',
  onBack
}) => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const slug = propSlug || paramSlug;
  
  const [article, setArticle] = useState<BlogArticleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('No article slug provided');
      setLoading(false);
      return;
    }

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const blogService = new BlogService(supabaseClient, 'blog_articles', !supabaseClient);
        const data = await blogService.getArticleBySlug(slug);
        
        if (!data) {
          setError('Article not found');
          setArticle(null);
        } else {
          setArticle(data);
          
          // Increment view count
          if (supabaseClient) {
            blogService.incrementViews(slug);
          }
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, supabaseClient]);

  // Update document title and meta tags
  useEffect(() => {
    if (article) {
      const metaTags = generateMetaTags(article);
      document.title = metaTags.title;

      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', metaTags.description);

      // Update meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', metaTags.keywords);

      // Inject AEO Schema if present
      if (article.aeo_schema) {
        // Remove existing schema script if any
        const existingSchema = document.querySelector('script[data-blog-schema]');
        if (existingSchema) {
          existingSchema.remove();
        }

        // Add new schema script
        const schemaScript = document.createElement('script');
        schemaScript.setAttribute('type', 'application/ld+json');
        schemaScript.setAttribute('data-blog-schema', 'true');
        const schemaWithContext = {
          '@context': 'https://schema.org',
          ...article.aeo_schema
        };
        schemaScript.textContent = JSON.stringify(schemaWithContext);
        document.head.appendChild(schemaScript);
      }
    }

    // Cleanup function to remove schema on unmount
    return () => {
      const schemaScript = document.querySelector('script[data-blog-schema]');
      if (schemaScript) {
        schemaScript.remove();
      }
    };
  }, [article]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(basePath);
    }
  };

  if (loading) {
    return (
      <div className={`blog-article-loading ${className}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={`blog-article-error ${className}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {error || 'Article Not Found'}
            </h1>
            <p className="text-gray-600 mb-8">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              ← Back to Blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const readTime = article.read_time || calculateReadTime(article.content);

  return (
    <article className={`blog-article ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Back to Blog
        </button>

        {/* Article header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {showAuthor && article.author && (
              <div className="flex items-center">
                <span className="font-medium">{article.author}</span>
              </div>
            )}
            
            {showDate && (
              <div className="flex items-center">
                <time dateTime={article.published_at}>
                  {formatDate(article.published_at, 'long')}
                </time>
              </div>
            )}
            
            <div className="flex items-center">
              <span>{readTime} min read</span>
            </div>
            
            {article.views !== undefined && (
              <div className="flex items-center">
                <span>{article.views.toLocaleString()} views</span>
              </div>
            )}
          </div>
        </header>

        {/* Featured image */}
        {article.featured_image && (
          <div className="mb-8">
            <img
              src={article.featured_image}
              alt={article.featured_image_alt || article.title}
              className="w-full h-auto rounded-lg shadow-lg"
              loading="lazy"
            />
          </div>
        )}

        {/* Direct Answer (AEO) */}
        {article.direct_answer && (
          <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Answer</h3>
                <p className="text-blue-800">{article.direct_answer}</p>
              </div>
            </div>
          </div>
        )}

        {/* Introduction */}
        {article.intro && (
          <div
            className="prose prose-lg max-w-none mb-8 text-lg text-gray-700"
            dangerouslySetInnerHTML={{ __html: article.intro }}
          />
        )}

        {/* Article content - either sections or regular content */}
        {article.sections && article.sections.length > 0 ? (
          <div className="prose prose-lg max-w-none mb-8">
            {article.sections.map((section, index) => {
              // Find image for this section
              const sectionImage = article.image_prompts?.find(
                img => img.sectionHeading === section.heading && img.status === 'done'
              );

              return (
                <div key={index} className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{section.heading}</h2>

                  {/* Section image */}
                  {sectionImage && (
                    <figure className="mb-6">
                      <img
                        src={sectionImage.imageUrl}
                        alt={sectionImage.altText}
                        className="w-full h-auto rounded-lg shadow-md"
                        loading="lazy"
                      />
                      {sectionImage.prompt && (
                        <figcaption className="text-sm text-gray-600 mt-2 text-center italic">
                          {sectionImage.prompt}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        )}

        {/* Internal Links */}
        {article.internal_links && article.internal_links.length > 0 && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Articles</h3>
            <ul className="space-y-3">
              {article.internal_links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.targetUrl}
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    {link.anchorText}
                  </a>
                  {link.justification && (
                    <p className="text-sm text-gray-600 mt-1">{link.justification}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {showTags && article.tags && article.tags.length > 0 && (
          <div className="border-t border-gray-200 pt-6 mt-8">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Article footer */}
        <footer className="border-t border-gray-200 pt-6 mt-8">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Blog
            </button>
            
            {article.updated_at && article.updated_at !== article.published_at && (
              <div className="text-sm text-gray-500">
                Last updated: {formatDate(article.updated_at, 'short')}
              </div>
            )}
          </div>
        </footer>
      </div>
    </article>
  );
};

export default BlogArticle;

