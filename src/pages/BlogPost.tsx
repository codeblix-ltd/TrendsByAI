import { BlogArticle } from 'react-supabase-ssg-blog';
import { supabase } from '@/lib/supabase';
import BlogHeader from '@/components/ui/BlogHeader';

/**
 * BlogPost page - displays a single blog article
 */
const BlogPost = () => {
  return (
    <div
      className="min-h-screen bg-[#0D0F18] bg-cover bg-center p-4 sm:p-6 lg:p-8"
      style={{ backgroundImage: 'url(https://i.pinimg.com/originals/5d/56/99/5d56993d543ac6735b31ee3e4ac29d95.gif)' }}
    >
      <div className="max-w-[1920px] mx-auto">
        <BlogHeader />

        <main className="mt-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8">
            <BlogArticle
              supabaseClient={supabase}
              basePath="/blog"
              showAuthor={true}
              showDate={true}
              showTags={true}
              showRelatedPosts={false}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default BlogPost;
