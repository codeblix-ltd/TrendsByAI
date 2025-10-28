# Deployment Guide

This guide covers deploying your React application with the blog package to various hosting platforms.

## Prerequisites

Before deploying, ensure:
- ✅ Blog works locally with mock data
- ✅ Supabase database is set up
- ✅ Environment variables are configured
- ✅ SSG is configured (optional but recommended)

## Platform-Specific Guides

### Vercel Deployment

Vercel is recommended for React + Vite applications.

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Configure vercel.json

Create `vercel.json` in your project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

#### 3. Add Environment Variables

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

#### 4. Deploy

```bash
vercel --prod
```

#### 5. Set Up Webhook for Auto-Rebuild

1. Go to Vercel Dashboard → Settings → Git
2. Copy the Deploy Hook URL
3. Use this URL in your Supabase trigger (see Webhook Setup below)

### Netlify Deployment

#### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. Configure netlify.toml

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  VITE_SUPABASE_URL = "your-supabase-url"
  VITE_SUPABASE_ANON_KEY = "your-anon-key"
```

#### 3. Deploy

```bash
netlify deploy --prod
```

#### 4. Set Up Build Hook

1. Go to Netlify Dashboard → Site Settings → Build & Deploy
2. Add a Build Hook
3. Copy the webhook URL
4. Use this URL in your Supabase trigger

### GitHub Pages

#### 1. Update vite.config.ts

```typescript
export default defineConfig({
  base: '/your-repo-name/',
  build: {
    outDir: 'dist'
  }
});
```

#### 2. Create Deploy Script

Add to `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

#### 3. Install gh-pages

```bash
npm install --save-dev gh-pages
```

#### 4. Deploy

```bash
npm run deploy
```

### AWS S3 + CloudFront

#### 1. Build Your Site

```bash
npm run build
```

#### 2. Create S3 Bucket

```bash
aws s3 mb s3://your-blog-bucket
```

#### 3. Configure Bucket for Static Hosting

```bash
aws s3 website s3://your-blog-bucket --index-document index.html
```

#### 4. Upload Files

```bash
aws s3 sync dist/ s3://your-blog-bucket --delete
```

#### 5. Set Up CloudFront

1. Create CloudFront distribution
2. Point to S3 bucket
3. Configure custom domain (optional)

## Static Site Generation Setup

For optimal SEO, configure SSG before deployment.

### 1. Install react-snap

```bash
npm install --save-dev react-snap
```

### 2. Update package.json

```json
{
  "scripts": {
    "build": "vite build && react-snap"
  },
  "reactSnap": {
    "include": [
      "/blog"
    ],
    "puppeteerArgs": [
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  }
}
```

### 3. Create Pre-build Script

Create `scripts/generate-blog-paths.js`:

```javascript
import { getBlogPaths } from 'react-supabase-ssg-blog';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function generatePaths() {
  const paths = await getBlogPaths(supabase);
  
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  packageJson.reactSnap = {
    ...packageJson.reactSnap,
    include: paths
  };
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
  
  console.log(`Generated ${paths.length} paths for SSG`);
}

generatePaths().catch(console.error);
```

### 4. Update Build Script

```json
{
  "scripts": {
    "prebuild": "node scripts/generate-blog-paths.js",
    "build": "vite build && react-snap"
  }
}
```

## Webhook Setup for Auto-Rebuild

To automatically rebuild when new articles are published:

### 1. Create Supabase Function

Run this SQL in Supabase:

```sql
-- Create function to call webhook
CREATE OR REPLACE FUNCTION notify_new_article()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'YOUR_DEPLOY_HOOK_URL';
BEGIN
  PERFORM net.http_post(
    url := webhook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object(
      'trigger', 'new_article',
      'slug', NEW.slug,
      'title', NEW.title
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER trigger_new_article
AFTER INSERT OR UPDATE ON blog_articles
FOR EACH ROW
WHEN (NEW.status = 'published')
EXECUTE FUNCTION notify_new_article();
```

### 2. Enable HTTP Extension

In Supabase SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS http;
```

### 3. Test the Webhook

Insert a new article and check if deployment triggers:

```sql
INSERT INTO blog_articles (
  slug, title, content, status
) VALUES (
  'test-webhook', 'Test Webhook', '<p>Testing</p>', 'published'
);
```

## Environment Variables

### Required Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Optional Variables

```env
VITE_BLOG_BASE_PATH=/blog
VITE_BLOG_POSTS_PER_PAGE=10
VITE_SITE_URL=https://yourdomain.com
```

## Performance Optimization

### 1. Enable Compression

Most platforms enable this by default, but verify:

**Netlify**: Automatic
**Vercel**: Automatic
**AWS**: Configure in CloudFront

### 2. Configure Caching

Set cache headers for static assets:

```
Cache-Control: public, max-age=31536000, immutable
```

### 3. Image Optimization

Use a CDN for images:
- Cloudinary
- Imgix
- Supabase Storage with CDN

### 4. Lazy Loading

The package already implements lazy loading for images.

## SEO Checklist

Before deploying, ensure:

- [ ] Meta tags are generated for all pages
- [ ] Sitemap.xml is generated
- [ ] Robots.txt is configured
- [ ] Open Graph tags are present
- [ ] Twitter Card tags are present
- [ ] Canonical URLs are set
- [ ] SSL certificate is configured
- [ ] Custom domain is set up (optional)

## Monitoring

### Set Up Analytics

Add analytics to track blog performance:

```typescript
// In BlogArticle component
useEffect(() => {
  if (article) {
    // Google Analytics
    gtag('event', 'page_view', {
      page_title: article.title,
      page_path: `/blog/${article.slug}`
    });
  }
}, [article]);
```

### Error Tracking

Set up error tracking with:
- Sentry
- LogRocket
- Rollbar

## Troubleshooting

### Build Fails

**Issue**: Build fails with TypeScript errors
**Solution**: Run `npm run build` locally first to catch errors

**Issue**: react-snap times out
**Solution**: Increase timeout in package.json:
```json
{
  "reactSnap": {
    "timeout": 60000
  }
}
```

### Deployment Issues

**Issue**: Environment variables not working
**Solution**: Ensure variables are prefixed with `VITE_`

**Issue**: Routes return 404
**Solution**: Configure redirects/rewrites for SPA routing

### Performance Issues

**Issue**: Slow page loads
**Solution**: 
1. Enable SSG
2. Optimize images
3. Use CDN
4. Enable compression

## Post-Deployment Checklist

- [ ] Test all blog routes
- [ ] Verify SEO meta tags in production
- [ ] Check Lighthouse scores
- [ ] Test on mobile devices
- [ ] Verify webhook triggers rebuilds
- [ ] Monitor error logs
- [ ] Set up analytics
- [ ] Submit sitemap to Google Search Console

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review build logs
3. Test locally first
4. Check environment variables
5. Verify Supabase connection

## Next Steps

After successful deployment:
1. Monitor performance with Lighthouse
2. Set up Google Search Console
3. Submit sitemap
4. Monitor analytics
5. Gather user feedback
6. Iterate and improve

Happy deploying! 🚀

