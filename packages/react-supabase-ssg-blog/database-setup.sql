-- ============================================================================
-- React Supabase SSG Blog - Database Setup
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor to set up the blog_articles table
-- ============================================================================

-- Create blog_articles table
CREATE TABLE IF NOT EXISTS public.blog_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Image fields (all images stored as URLs in Supabase Storage)
    featured_image TEXT,
    featured_image_alt TEXT,

    -- Timestamps
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Status and categorization
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    tags TEXT[],
    category TEXT,

    -- SEO metadata
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],

    -- Article metrics
    read_time INTEGER,
    views INTEGER DEFAULT 0,

    -- SEO Platform Integration Fields
    intro TEXT,
    direct_answer TEXT,
    sections JSONB DEFAULT '[]'::jsonb,
    image_prompts JSONB DEFAULT '[]'::jsonb,
    aeo_schema JSONB,
    content_score JSONB,
    internal_links JSONB DEFAULT '[]'::jsonb
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON public.blog_articles(slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_status ON public.blog_articles(status);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published_at ON public.blog_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_articles_author_id ON public.blog_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_articles_category ON public.blog_articles(category);
CREATE INDEX IF NOT EXISTS idx_blog_articles_tags ON public.blog_articles USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read published articles" ON public.blog_articles;
DROP POLICY IF EXISTS "Authors can read their own drafts" ON public.blog_articles;
DROP POLICY IF EXISTS "Authenticated users can create articles" ON public.blog_articles;
DROP POLICY IF EXISTS "Authors can update their own articles" ON public.blog_articles;
DROP POLICY IF EXISTS "Authors can delete their own articles" ON public.blog_articles;

-- Policy: Anyone can read published articles
CREATE POLICY "Anyone can read published articles"
ON public.blog_articles
FOR SELECT
USING (status = 'published');

-- Policy: Authenticated users can read their own drafts
CREATE POLICY "Authors can read their own drafts"
ON public.blog_articles
FOR SELECT
USING (auth.uid() = author_id);

-- Policy: Authenticated users can create articles
CREATE POLICY "Authenticated users can create articles"
ON public.blog_articles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Policy: Authors can update their own articles
CREATE POLICY "Authors can update their own articles"
ON public.blog_articles
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Policy: Authors can delete their own articles
CREATE POLICY "Authors can delete their own articles"
ON public.blog_articles
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_blog_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_blog_articles_updated_at_trigger ON public.blog_articles;

-- Trigger to call the function before update
CREATE TRIGGER update_blog_articles_updated_at_trigger
BEFORE UPDATE ON public.blog_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_articles_updated_at();

-- Function to increment article views
CREATE OR REPLACE FUNCTION public.increment_article_views(article_slug TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.blog_articles
    SET views = views + 1
    WHERE slug = article_slug AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the increment_article_views function
GRANT EXECUTE ON FUNCTION public.increment_article_views(TEXT) TO anon, authenticated;

-- Table comments
COMMENT ON TABLE public.blog_articles IS 'Stores blog articles for the react-supabase-ssg-blog package';
COMMENT ON COLUMN public.blog_articles.slug IS 'URL-friendly unique identifier for the article';
COMMENT ON COLUMN public.blog_articles.status IS 'Article status: draft, published, or archived';
COMMENT ON COLUMN public.blog_articles.tags IS 'Array of tags for categorization and search';
COMMENT ON COLUMN public.blog_articles.views IS 'Number of times the article has been viewed';
COMMENT ON COLUMN public.blog_articles.featured_image IS 'URL to featured image stored in Supabase Storage';
COMMENT ON COLUMN public.blog_articles.featured_image_alt IS 'Alt text for featured image (SEO and accessibility)';
COMMENT ON COLUMN public.blog_articles.intro IS 'Introduction text/HTML for the article';
COMMENT ON COLUMN public.blog_articles.direct_answer IS 'Direct answer for AEO (Answer Engine Optimization)';
COMMENT ON COLUMN public.blog_articles.sections IS 'Array of article sections with heading and content';
COMMENT ON COLUMN public.blog_articles.image_prompts IS 'Array of images with URLs, alt text, and section associations';
COMMENT ON COLUMN public.blog_articles.aeo_schema IS 'Structured data schema (FAQ, HowTo, etc.) for AEO';
COMMENT ON COLUMN public.blog_articles.content_score IS 'Content quality scores from SEO analysis';
COMMENT ON COLUMN public.blog_articles.internal_links IS 'Array of internal link suggestions with anchor text and justification';

-- =====================================================
-- STORAGE BUCKET FOR IMAGES
-- =====================================================

-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for article-images bucket
CREATE POLICY "Anyone can read article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'article-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their article images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'article-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their article images"
ON storage.objects FOR DELETE
USING (bucket_id = 'article-images' AND auth.role() = 'authenticated');

-- Drop all policies on blog_articles (We dont need any RLS anymore, remove all!)
DROP POLICY IF EXISTS "Anyone can read published articles" ON public.blog_articles;
DROP POLICY IF EXISTS "Authors can read their own drafts" ON public.blog_articles;
DROP POLICY IF EXISTS "Authenticated users can create articles" ON public.blog_articles;
DROP POLICY IF EXISTS "Authors can update their own articles" ON public.blog_articles;
DROP POLICY IF EXISTS "Authors can delete their own articles" ON public.blog_articles;

-- Disable RLS
ALTER TABLE public.blog_articles DISABLE ROW LEVEL SECURITY;

-- Create allow-all policy
CREATE POLICY "Allow all access to blog_articles"
ON public.blog_articles
FOR ALL
USING (true)
WITH CHECK (true);