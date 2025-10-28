import { BlogArticle } from 'react-supabase-ssg-blog';
import { supabase } from '@/lib/supabase'; // Update this path to your Supabase client

/**
 * BlogPost page - displays a single blog article
 */
const BlogPost = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <BlogArticle 
        supabaseClient={supabase}
        basePath="/blog"
        showAuthor={true}
        showDate={true}
        showTags={true}
        showRelatedPosts={false}
      />
    </div>
  );
};

export default BlogPost;
