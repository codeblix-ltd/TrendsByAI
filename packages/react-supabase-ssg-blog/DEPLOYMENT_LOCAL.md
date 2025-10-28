# Installation Guide

## 🚀 Automated Installation (Recommended)

The package now includes **automatic setup** that configures everything for you!

### For External Projects (Published Package)

```bash
# Install from npm (when published)
npm install react-supabase-ssg-blog
# or
pnpm add react-supabase-ssg-blog
# or
yarn add react-supabase-ssg-blog

# ✅ Auto-setup runs automatically!
```

### For Local/Monorepo Setup (EpicFreelancer Style)

If you're using the package from a local `packages/` folder:

```bash
# 1. Install dependencies first
pnpm add -D puppeteer serve-handler
# or
npm install --save-dev puppeteer serve-handler

# 2. Run manual setup (postinstall doesn't run for local packages)
node packages/react-supabase-ssg-blog/scripts/cli.cjs setup

# ✅ This will configure everything automatically!
```

**Why manual setup for local packages?**
- Postinstall hooks don't run for local packages in the same workspace
- This is a Node.js/npm/pnpm limitation, not a bug
- The CLI setup does the exact same thing as postinstall

### What Gets Automated

The postinstall script automatically:
- ✅ Adds `generate-sitemap`, `prerender`, `copy-htaccess` scripts to package.json
- ✅ Updates your `build` script to include SSG steps
- ✅ Creates `public/.htaccess` with proper routing
- ✅ Creates `src/pages/Blog.tsx` and `src/pages/BlogPost.tsx` (if they don't exist)
- ✅ Creates `.env.example` with required variables
- ✅ Checks for required dependencies
- ✅ **Auto-imports CSS** in your `App.tsx` file for default styling

### Package Manager Detection

The setup script automatically detects your package manager:
- ✅ Detects **pnpm** (if scripts contain `pnpm`)
- ✅ Detects **yarn** (if scripts contain `yarn`)
- ✅ Falls back to **npm**

It will show the correct install command for missing dependencies!

---

## 📋 Manual Installation (Alternative)

If you prefer to set up manually or need to customize:

### 1. Install Package

Make sure the /packages folder exists at the root folder:

```bash
npm install ./packages/react-supabase-ssg-blog
```

### 2. Install Dependencies

```bash
npm install --save-dev puppeteer serve-handler
```

### 3. Edit src/App.tsx

Add the following routes:

```tsx
import { BlogIndex, BlogArticle } from 'react-supabase-ssg-blog';
import { supabase } from './lib/supabaseClient';

  <Routes>
    <Route path="/blog" element={<BlogIndex supabaseClient={supabase} />} />
    <Route path="/blog/:slug" element={<BlogArticle supabaseClient={supabase} />} />
  </Routes>

```

### 4. Create src/pages/Blog.tsx

```tsx
import { BlogIndex } from 'react-supabase-ssg-blog';
import { supabase } from '@/lib/supabase'; //Make sure to point to your supabase client

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

```

### 5. Create src/pages/BlogPost.tsx

```tsx
import { BlogArticle } from 'react-supabase-ssg-blog';
import { supabase } from '@/lib/supabase'; //Make sure to point to your supabase client

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

```

### 6. Update package.json Scripts

```json
  "scripts": {
    "build": "npm run generate-sitemap && vite build && npm run copy-htaccess && npm run prerender",
    "generate-sitemap": "node packages/react-supabase-ssg-blog/scripts/generate-sitemap.cjs",
    "prerender": "node packages/react-supabase-ssg-blog/scripts/prerender.cjs",
    "copy-htaccess": "node -e \"require('fs').copyFileSync('public/.htaccess', 'dist/.htaccess')\"",
  }
```

### 7. Create Environment Variables

```env
VITE_SUPABASE_URL=https://dmcrnqeekjjjjejgfhyj.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://domain.com
```

### 8. Update vite.config.ts

```ts
  publicDir: 'public',
  build: {
    outDir: 'dist',
    // Copy .htaccess file to dist
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep .htaccess in root of dist
          if (assetInfo.name === '.htaccess') {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  }
```

**Important**: Make sure vite.config.ts has the React plugin:

```ts
plugins: [
  react()
]
```

### 9. Build Your Project

```bash
npm run build
```

---

## 🎯 For 100+ Projects - Best Practices

### Option 1: NPM Package (Recommended for Scale)

Publish your package to NPM for easy installation across all projects:

```bash
# 1. Publish to NPM (one time)
cd packages/react-supabase-ssg-blog
npm publish

# 2. In each project (automated)
npm install react-supabase-ssg-blog
# Postinstall script runs automatically!

# 3. Just configure Supabase credentials
# Edit .env file with your Supabase URL and keys

# 4. Build
npm run build
```

### Option 2: Private NPM Registry

For private packages:

```bash
# Use GitHub Packages, Verdaccio, or npm private registry
npm install @yourcompany/react-supabase-ssg-blog
```

### Option 3: Git Submodule

```bash
# In each project
git submodule add https://github.com/youruser/react-supabase-ssg-blog packages/react-supabase-ssg-blog
npm install ./packages/react-supabase-ssg-blog
```

### Option 4: Copy Script

Create a deployment script:

```bash
#!/bin/bash
# deploy-blog.sh

# Copy package to project
cp -r /path/to/react-supabase-ssg-blog ./packages/

# Install
npm install ./packages/react-supabase-ssg-blog

# Auto-setup runs via postinstall

# Configure environment
echo "VITE_SUPABASE_URL=$SUPABASE_URL" >> .env
echo "VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY" >> .env
echo "VITE_SITE_URL=$SITE_URL" >> .env

# Build
npm run build
```

---

## ✅ What's Automated vs Manual

### Fully Automated ✅
- package.json script updates
- .htaccess creation
- Example page creation
- .env.example creation
- Dependency checking

### Requires Manual Setup ⚠️
- Adding routes to App.tsx (varies by project structure)
- Supabase client configuration (varies by project)
- Environment variable values (unique per project)
- Vite config updates (if not standard)

### One-Time Manual (Per Project)
- Update Supabase credentials in .env
- Add blog routes to App.tsx
- Verify Supabase client path in Blog pages

---

## 🚀 Deployment Workflow for 100 Projects

```bash
# 1. Publish package to NPM (one time)
npm publish

# 2. For each project (can be scripted):
cd /path/to/project
npm install react-supabase-ssg-blog  # Auto-setup runs
# Edit .env with project-specific Supabase credentials
# Add routes to App.tsx (can be templated)
npm run build
# Deploy dist/ folder

# 3. Repeat for all 100 projects!
```

---

## 📝 Checklist for Each Project

- [ ] Install package: `npm install react-supabase-ssg-blog`
- [ ] Verify postinstall ran successfully
- [ ] Update .env with Supabase credentials
- [ ] Add blog routes to App.tsx
- [ ] Verify Supabase client path in Blog.tsx and BlogPost.tsx
- [ ] Run `npm run build`
- [ ] Verify static HTML generated in dist/blog/
- [ ] Deploy dist/ folder to hosting
- [ ] Test: Visit /blog/article-slug/ and view source

---

## 🎉 Summary

**For 100 projects, the workflow is:**

1. **One-time**: Publish package to NPM
2. **Per project** (5 minutes each):
   - `npm install react-supabase-ssg-blog`
   - Update .env
   - Add routes to App.tsx
   - `npm run build`
   - Deploy

**90% automated, 10% project-specific configuration!**

---

## ⚡ Performance Optimization

### Parallel Rendering

The prerender script now supports **parallel processing** for faster builds!

**Default Configuration**:
- Renders **5 pages at a time** in parallel
- Automatic retry on failure (2 retries)
- Progress tracking by batch

**Performance Metrics** (9 pages):
- **Sequential**: ~5 minutes (0.03 pages/second)
- **Parallel (5x)**: ~17 seconds (0.52 pages/second)
- **Speed improvement**: ~17x faster! 🚀

**For 500 articles**:
- **Sequential**: ~4 hours
- **Parallel (5x)**: ~16 minutes
- **Parallel (10x)**: ~8 minutes (adjust based on your system)

### Adjusting Parallel Workers

Edit `packages/react-supabase-ssg-blog/scripts/prerender.cjs`:

```javascript
const CONFIG = {
  // ...
  parallelPages: 10, // Increase for more speed (default: 5)
  maxRetries: 2,     // Retry failed pages
};
```

**Recommendations**:
- **Low-end systems**: 3-5 parallel pages
- **Mid-range systems**: 5-10 parallel pages
- **High-end systems**: 10-20 parallel pages
- **CI/CD servers**: 5-10 parallel pages

**Note**: More parallel pages = more memory usage. Monitor your system resources.

### Build Time Estimates

| Articles | Sequential | Parallel (5x) | Parallel (10x) |
|----------|-----------|---------------|----------------|
| 10       | 5 min     | 20 sec        | 15 sec         |
| 50       | 25 min    | 2 min         | 1 min          |
| 100      | 50 min    | 3.5 min       | 2 min          |
| 500      | 4 hours   | 16 min        | 8 min          |
| 1000     | 8 hours   | 32 min        | 16 min         |

### Optimization Tips

1. **Use a fast SSD** for better I/O performance
2. **Increase Node.js memory** if needed:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```
3. **Run on a powerful machine** for initial builds
4. **Use incremental builds** - only rebuild changed articles (future feature)
5. **Consider CDN caching** to reduce rebuild frequency