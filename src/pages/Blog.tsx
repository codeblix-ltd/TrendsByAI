import { BlogIndex } from 'react-supabase-ssg-blog';
import { supabase } from '@/lib/supabase';
import BlogHeader from '@/components/ui/BlogHeader';
import '../styles/blog-overrides.css';

/**
 * Blog page - displays list of blog articles
 */
const Blog = () => {
  return (
    <div
      className="min-h-screen bg-[#0D0F18] bg-cover bg-center"
      style={{ backgroundImage: 'url(https://i.pinimg.com/originals/5d/56/99/5d56993d543ac6735b31ee3e4ac29d95.gif)' }}
    >
      <div className="max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8">
        <BlogHeader />

        <main className="mt-8">
          <BlogIndex
            supabaseClient={supabase}
            basePath="/blog"
            postsPerPage={10}
            showExcerpt={true}
            showAuthor={true}
            showDate={true}
            showTags={true}
          />
        </main>
      </div>
    </div>
  );
};

export default Blog;
