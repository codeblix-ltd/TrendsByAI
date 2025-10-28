-- ============================================================================
-- React Supabase SSG Blog - Sample Data
-- ============================================================================
-- Run this SQL after database-setup.sql to insert sample blog articles
-- ============================================================================

INSERT INTO public.blog_articles (
    slug,
    title,
    content,
    excerpt,
    author,
    featured_image,
    featured_image_alt,
    published_at,
    status,
    tags,
    category,
    meta_title,
    meta_description,
    meta_keywords,
    read_time,
    views,
    intro,
    direct_answer,
    sections,
    image_prompts,
    aeo_schema,
    content_score,
    internal_links
) VALUES
(
    'complete-guide-to-react-ssg',
    'Complete Guide to React Static Site Generation',
    '<p>This article covers everything you need to know about Static Site Generation in React applications.</p>',
    'Learn how to implement Static Site Generation in your React applications for better SEO and performance.',
    'John Doe',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200',
    'React code on a computer screen with colorful syntax highlighting',
    NOW() - INTERVAL '5 days',
    'published',
    ARRAY['React', 'SSG', 'SEO', 'Performance'],
    'Web Development',
    'Complete Guide to React Static Site Generation | SEO Best Practices',
    'Learn how to implement Static Site Generation in your React applications for better SEO and performance. Complete guide with examples.',
    ARRAY['React', 'SSG', 'Static Site Generation', 'SEO', 'Performance'],
    8,
    245,
    '<p>Static Site Generation (SSG) is a powerful technique for building fast, SEO-friendly React applications. In this comprehensive guide, we''ll explore everything you need to know about implementing SSG in your projects.</p>',
    'Static Site Generation (SSG) pre-renders pages at build time, creating static HTML files that load instantly and rank better in search engines.',
    '[
        {
            "heading": "What is Static Site Generation?",
            "content": "<p>Static Site Generation is a method of building websites where pages are pre-rendered at build time rather than on each request. This results in faster load times and better SEO performance.</p><p>Unlike traditional server-side rendering, SSG generates all pages during the build process, creating static HTML files that can be served directly from a CDN.</p>"
        },
        {
            "heading": "Benefits of SSG for React Applications",
            "content": "<p>There are several key benefits to using SSG in your React applications:</p><ul><li><strong>Performance:</strong> Pages load instantly since they''re pre-rendered</li><li><strong>SEO:</strong> Search engines can easily crawl and index your content</li><li><strong>Security:</strong> No server-side code execution reduces attack surface</li><li><strong>Scalability:</strong> Static files can be served from CDNs worldwide</li></ul>"
        },
        {
            "heading": "Implementing SSG with React",
            "content": "<p>To implement SSG in your React application, you can use tools like react-snap or frameworks like Next.js. Here''s a basic example:</p><pre><code>npm install --save-dev react-snap</code></pre><p>Then update your package.json to include the build script that runs react-snap after building your application.</p>"
        }
    ]'::jsonb,
    '[
        {
            "prompt": "Diagram showing Static Site Generation workflow",
            "status": "done",
            "altText": "Flowchart illustrating the SSG build process from source code to static HTML files",
            "imageUrl": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
            "sectionHeading": "What is Static Site Generation?"
        },
        {
            "prompt": "Performance comparison chart",
            "status": "done",
            "altText": "Bar chart comparing load times between SSG, SSR, and CSR approaches",
            "imageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
            "sectionHeading": "Benefits of SSG for React Applications"
        }
    ]'::jsonb,
    '{
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is Static Site Generation?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Static Site Generation is a method of building websites where pages are pre-rendered at build time rather than on each request, resulting in faster load times and better SEO performance."
                }
            },
            {
                "@type": "Question",
                "name": "Why use SSG for React applications?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "SSG provides better performance, improved SEO, enhanced security, and better scalability by serving pre-rendered static HTML files from CDNs."
                }
            }
        ]
    }'::jsonb,
    '{
        "overall": 92,
        "aeo": {
            "score": 95,
            "feedback": "Excellent AEO optimization with clear direct answer and FAQ schema"
        },
        "keywords": {
            "score": 88,
            "feedback": "Good keyword usage throughout the article"
        },
        "structure": {
            "score": 94,
            "feedback": "Well-structured with clear headings and logical flow"
        },
        "readability": {
            "score": 90,
            "feedback": "Clear and concise writing suitable for technical audience"
        }
    }'::jsonb,
    '[
        {
            "targetUrl": "/blog/react-performance-optimization",
            "anchorText": "React performance optimization",
            "justification": "Related topic about improving React app performance"
        },
        {
            "targetUrl": "/blog/seo-best-practices",
            "anchorText": "SEO best practices",
            "justification": "Complementary content about SEO strategies"
        }
    ]'::jsonb
),
(
    'supabase-storage-image-management',
    'Managing Images with Supabase Storage',
    '<p>Learn how to efficiently manage and serve images using Supabase Storage in your applications.</p>',
    'A comprehensive guide to storing, retrieving, and optimizing images with Supabase Storage.',
    'Jane Smith',
    'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=1200',
    'Supabase logo with cloud storage icons in the background',
    NOW() - INTERVAL '3 days',
    'published',
    ARRAY['Supabase', 'Storage', 'Images', 'Backend'],
    'Backend Development',
    'Managing Images with Supabase Storage | Complete Guide',
    'Learn how to efficiently manage and serve images using Supabase Storage. Includes upload, retrieval, and optimization techniques.',
    ARRAY['Supabase', 'Storage', 'Images', 'CDN', 'Backend'],
    6,
    189,
    '<p>Supabase Storage provides a powerful and scalable solution for managing images and files in your applications. This guide will show you how to leverage it effectively.</p>',
    'Supabase Storage is an S3-compatible object storage service that allows you to store and serve files with built-in CDN, access control, and automatic image transformations.',
    '[
        {
            "heading": "Setting Up Supabase Storage",
            "content": "<p>To get started with Supabase Storage, you first need to create a storage bucket in your Supabase project. Buckets are containers for your files, similar to folders.</p><p>You can create buckets through the Supabase dashboard or programmatically using the Supabase client library.</p>"
        },
        {
            "heading": "Uploading Images to Storage",
            "content": "<p>Uploading images to Supabase Storage is straightforward. Here''s an example:</p><pre><code>const { data, error } = await supabase.storage\n  .from(''article-images'')\n  .upload(''image.png'', file);</code></pre><p>The uploaded images are automatically served through Supabase''s CDN for fast global delivery.</p>"
        },
        {
            "heading": "Image Optimization and Transformations",
            "content": "<p>Supabase Storage supports automatic image transformations. You can resize, crop, and optimize images on-the-fly by adding query parameters to the image URL.</p><p>This eliminates the need for manual image processing and ensures optimal performance across devices.</p>"
        }
    ]'::jsonb,
    '[
        {
            "prompt": "Supabase Storage dashboard screenshot",
            "status": "done",
            "altText": "Screenshot of Supabase Storage interface showing bucket management",
            "imageUrl": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
            "sectionHeading": "Setting Up Supabase Storage"
        }
    ]'::jsonb,
    '{
        "@type": "HowTo",
        "name": "How to Upload Images to Supabase Storage",
        "step": [
            {
                "@type": "HowToStep",
                "name": "Create a Storage Bucket",
                "text": "Create a new bucket in your Supabase project dashboard or using the API"
            },
            {
                "@type": "HowToStep",
                "name": "Upload Your Image",
                "text": "Use the Supabase client library to upload your image file to the bucket"
            },
            {
                "@type": "HowToStep",
                "name": "Get the Public URL",
                "text": "Retrieve the public URL of your uploaded image to use in your application"
            }
        ]
    }'::jsonb,
    '{
        "overall": 88,
        "aeo": {
            "score": 90,
            "feedback": "Good HowTo schema implementation with clear steps"
        },
        "keywords": {
            "score": 85,
            "feedback": "Adequate keyword coverage for the topic"
        },
        "structure": {
            "score": 92,
            "feedback": "Clear structure with practical examples"
        },
        "readability": {
            "score": 86,
            "feedback": "Technical but accessible writing style"
        }
    }'::jsonb,
    '[
        {
            "targetUrl": "/blog/complete-guide-to-react-ssg",
            "anchorText": "Static Site Generation",
            "justification": "Related topic about serving static content efficiently"
        }
    ]'::jsonb
);

-- Verify the inserted data
SELECT
    slug,
    title,
    status,
    jsonb_array_length(sections) as section_count,
    jsonb_array_length(image_prompts) as image_count,
    aeo_schema->>'@type' as schema_type
FROM public.blog_articles
WHERE slug IN ('complete-guide-to-react-ssg', 'supabase-storage-image-management');

