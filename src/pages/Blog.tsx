import { BlogIndex } from 'react-supabase-ssg-blog';
import { supabase } from '@/lib/supabase'; // Update this path to your Supabase client

/**
 * Blog page - displays list of blog articles
 */
const Blog = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <BlogIndex 
        supabaseClient={supabase}
        basePath="/blog"
        postsPerPage={10}
        showExcerpt={true}
        showAuthor={true}
        showDate={true}
        showTags={true}
      />
    </div>
  );
};

export default Blog;
