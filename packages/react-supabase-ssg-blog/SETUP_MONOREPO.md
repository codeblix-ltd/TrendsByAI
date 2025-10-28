# Monorepo / Local Package Setup Guide

## 🎯 For Projects Like EpicFreelancer

If you're using this package from a local `packages/` folder (monorepo style), follow these steps:

---

## 📦 Installation Steps

### 1. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm add -D puppeteer serve-handler

# Or using npm
npm install --save-dev puppeteer serve-handler
```

### 2. Run Setup Script

```bash
node packages/react-supabase-ssg-blog/scripts/cli.cjs setup
```

This will automatically:
- ✅ Update your `package.json` scripts
- ✅ Create `public/.htaccess` with routing
- ✅ Create example Blog pages (if they don't exist)
- ✅ Create `.env.example`
- ✅ **Auto-import CSS** in your `App.tsx`
- ✅ Detect your package manager (pnpm/npm/yarn)

---

## 🔧 What Gets Modified

### package.json

Your build script will be updated from:

```json
{
  "scripts": {
    "build": "yes | pnpm install && rm -rf node_modules/.vite-temp && tsc -b && vite build"
  }
}
```

To:

```json
{
  "scripts": {
    "build": "npm run generate-sitemap && yes | pnpm install && rm -rf node_modules/.vite-temp && tsc -b && vite build && npm run copy-htaccess && npm run prerender",
    "generate-sitemap": "node packages/react-supabase-ssg-blog/scripts/generate-sitemap.cjs",
    "prerender": "node packages/react-supabase-ssg-blog/scripts/prerender.cjs",
    "copy-htaccess": "node -e \"require('fs').copyFileSync('public/.htaccess', 'dist/.htaccess')\""
  }
}
```

### App.tsx

The CSS import will be added automatically:

```tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
// ... other imports

// Blog package default styles
import 'react-supabase-ssg-blog/src/styles/index.css';

function App() {
  // ...
}
```

---

## 🚀 Usage

### Development

```bash
pnpm dev
# or
npm run dev
```

### Build (with SSG)

```bash
pnpm build
# or
npm run build
```

This will:
1. Generate sitemap.xml
2. Build your Vite app
3. Copy .htaccess to dist/
4. **Prerender all blog pages** (parallel mode, 5 at a time)

---

## ⚡ Performance

**Parallel Rendering** is enabled by default:
- Renders **5 pages simultaneously**
- Auto-retry on failure
- Progress tracking

**For 500 articles**: ~16 minutes (vs 4 hours sequential)

To adjust parallel workers, edit `packages/react-supabase-ssg-blog/scripts/prerender.cjs`:

```javascript
const CONFIG = {
  parallelPages: 10, // Increase for faster builds
  maxRetries: 2,
};
```

---

## 🔍 Troubleshooting

### Setup doesn't run automatically

**Why?** Postinstall hooks don't run for local packages in the same workspace.

**Solution:** Run the setup manually:
```bash
node packages/react-supabase-ssg-blog/scripts/cli.cjs setup
```

### CSS not imported

**Check:** Look for this line in your `App.tsx`:
```tsx
import 'react-supabase-ssg-blog/src/styles/index.css';
```

**If missing:** Run setup again or add manually.

### Wrong package manager detected

The script detects your package manager by checking `package.json` scripts.

If it detects the wrong one, you can still use your preferred package manager - the detection only affects the help messages.

### Build fails with "Cannot find module"

**Make sure dependencies are installed:**
```bash
pnpm add -D puppeteer serve-handler
```

---

## 📝 Next Steps

After setup:

1. **Configure Supabase** in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_SITE_URL=https://yourdomain.com
   ```

2. **Create your blog routes** in your router:
   ```tsx
   import { BlogIndex, BlogArticle } from 'react-supabase-ssg-blog';
   
   <Route path="/blog" element={<BlogIndex />} />
   <Route path="/blog/:slug" element={<BlogArticle />} />
   ```

3. **Build and test**:
   ```bash
   pnpm build
   ```

4. **Deploy** to your shared hosting!

---

## 🎯 For 100+ Projects

Once you have this working in one project, deploying to 100+ projects is easy:

```bash
# For each project:
cd /path/to/project

# 1. Copy the package folder
cp -r /path/to/epicfreelancer/packages/react-supabase-ssg-blog ./packages/

# 2. Install dependencies
pnpm add -D puppeteer serve-handler

# 3. Run setup
node packages/react-supabase-ssg-blog/scripts/cli.cjs setup

# 4. Configure .env
# Edit .env with project-specific values

# 5. Build
pnpm build

# 6. Deploy
# Upload dist/ folder to hosting
```

**Time per project**: ~5 minutes (vs 15 minutes manual setup)

---

## ✅ Checklist

- [ ] Dependencies installed (`puppeteer`, `serve-handler`)
- [ ] Setup script run (`node packages/.../cli.cjs setup`)
- [ ] `.env` configured with Supabase credentials
- [ ] Blog routes added to router
- [ ] CSS import in App.tsx (auto-added)
- [ ] Build successful (`pnpm build`)
- [ ] Static HTML files generated in `dist/blog/`
- [ ] `.htaccess` copied to `dist/`

---

## 🆘 Need Help?

See `DEPLOYMENT_LOCAL.md` for detailed documentation.

