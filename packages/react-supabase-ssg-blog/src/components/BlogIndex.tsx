import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { BlogArticle, BlogIndexProps, PaginationInfo } from '../types';
import { BlogService } from '../services/blogService';
import { formatDate, generateExcerpt } from '../utils/ssgHelpers';

/**
 * BlogIndex Component
 * Displays a list of blog articles with pagination
 */
export const BlogIndex: React.FC<BlogIndexProps> = ({
  supabaseClient,
  basePath = '/blog',
  postsPerPage = 10,
  showExcerpt = true,
  showAuthor = true,
  showDate = true,
  showTags = true,
  className = '',
  onArticleClick
}) => {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: postsPerPage,
    hasNext: false,
    hasPrevious: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const blogService = new BlogService(supabaseClient, 'blog_articles', !supabaseClient);
      const response = await blogService.getArticlesPaginated(page, postsPerPage);
      
      setArticles(response.articles);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(1);
  }, [supabaseClient, postsPerPage]);

  useEffect(() => {
    // Update document title
    document.title = 'Blog - Latest Articles';
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Read our latest blog articles on web development, React, and more.');
  }, []);

  const handleArticleClick = (e: React.MouseEvent, article: BlogArticle) => {
    if (onArticleClick) {
      e.preventDefault();
      onArticleClick(article);
    }
    // If no custom handler, let the Link component handle navigation
  };

  const handlePageChange = (newPage: number) => {
    fetchArticles(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && articles.length === 0) {
    return (
      <div className={`blog-index-loading ${className}`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`blog-index-error ${className}`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error}
            </h2>
            <p className="text-gray-600">
              Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className={`blog-index-empty ${className}`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Articles Yet
            </h2>
            <p className="text-gray-600">
              Check back soon for new content!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`blog-index ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Blog
          </h1>
          <p className="text-xl text-gray-600">
            Latest articles and insights
          </p>
        </header>

        {/* Articles grid */}
        <div className="space-y-8 mb-12">
          {articles.map((article) => (
            <article
              key={article.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <Link
                to={`${basePath}/${article.slug}`}
                onClick={(e) => handleArticleClick(e, article)}
                className="block md:flex no-underline text-inherit"
              >
                {/* Featured image */}
                {article.featured_image && (
                  <div className="md:w-1/3">
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-48 md:h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Content */}
                <div className={`p-6 ${article.featured_image ? 'md:w-2/3' : 'w-full'}`}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600">
                    {article.title}
                  </h2>

                  {/* Meta information */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
                    {showAuthor && article.author && (
                      <span className="font-medium">{article.author}</span>
                    )}

                    {showDate && (
                      <time dateTime={article.published_at}>
                        {formatDate(article.published_at, 'short')}
                      </time>
                    )}

                    {article.read_time && (
                      <span>{article.read_time} min read</span>
                    )}

                    {article.category && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {article.category}
                      </span>
                    )}
                  </div>

                  {/* Excerpt */}
                  {showExcerpt && (
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {article.excerpt || generateExcerpt(article.content)}
                    </p>
                  )}

                  {/* Tags */}
                  {showTags && article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          +{article.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Read more link */}
                  <div className="text-blue-600 hover:text-blue-800 font-medium">
                    Read more →
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <nav className="flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevious}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 border rounded-md ${
                    page === pagination.currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default BlogIndex;

