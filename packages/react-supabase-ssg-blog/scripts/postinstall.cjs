#!/usr/bin/env node

/**
 * Post-install script for react-supabase-ssg-blog
 * Automatically sets up the blog package in the host project
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

// Find the project root (where package.json is)
function findProjectRoot() {
  let currentDir = process.cwd();

  // Go up until we find the root package.json (not in node_modules)
  while (currentDir.includes('node_modules')) {
    currentDir = path.dirname(currentDir);
  }

  return currentDir;
}

const projectRoot = findProjectRoot();
const packageRoot = __dirname.replace(/scripts$/, '');

log.title('🚀 React Supabase SSG Blog - Auto Setup');

// Check if running in CI or non-interactive environment
const isCI = process.env.CI === 'true' || !process.stdin.isTTY;

// Check if this is a local package install (same workspace)
const isLocalInstall = !projectRoot.includes('node_modules') &&
                       projectRoot === path.resolve(__dirname, '../../..');

// Allow forcing setup via environment variable
const forceSetup = process.env.FORCE_SETUP === 'true';

if (isCI && !forceSetup) {
  log.info('Running in CI/non-interactive mode - skipping auto-setup');
  log.info('Run "npx react-supabase-ssg-blog setup" manually to configure');
  process.exit(0);
}

if (isLocalInstall && !forceSetup) {
  log.warning('Detected local package installation (monorepo/workspace)');
  log.info('Postinstall skipped for local packages');
  log.info('');
  log.info('To setup the package, run:');
  log.info('  FORCE_SETUP=true node packages/react-supabase-ssg-blog/scripts/postinstall.cjs');
  log.info('  or');
  log.info('  node packages/react-supabase-ssg-blog/scripts/cli.cjs setup');
  log.info('');
  process.exit(0);
}

async function setup() {
  try {
    // 1. Check and update package.json scripts
    await updatePackageJson();

    // 2. Install required dependencies
    await checkDependencies();

    // 3. Copy .htaccess template
    await copyHtaccess();

    // 4. Create example pages (optional)
    await createExamplePages();

    // 5. Update vite.config
    await updateViteConfig();

    // 6. Create .env.example
    await createEnvExample();

    // 7. Auto-import CSS in App.tsx
    await autoImportCSS();
    
    log.title('✨ Setup Complete!');
    log.success('Blog package is ready to use');
    log.info('\nNext steps:');
    log.info('1. Update your .env file with Supabase credentials');
    log.info('2. Add blog routes to your App.tsx (see DEPLOYMENT_LOCAL.md)');
    log.info('3. Run "npm run build" to generate static blog pages');
    log.info('\n📚 Documentation: packages/react-supabase-ssg-blog/DEPLOYMENT_LOCAL.md\n');
    
  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    log.info('You can run setup manually later with: npx react-supabase-ssg-blog setup');
  }
}

async function updatePackageJson() {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    log.warning('package.json not found - skipping script updates');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const scriptsToAdd = {
    'generate-sitemap': 'node packages/react-supabase-ssg-blog/scripts/generate-sitemap.cjs',
    'prerender': 'node packages/react-supabase-ssg-blog/scripts/prerender.cjs',
    'copy-htaccess': 'node -e "require(\'fs\').copyFileSync(\'public/.htaccess\', \'dist/.htaccess\')"',
  };
  
  let updated = false;
  packageJson.scripts = packageJson.scripts || {};
  
  // Add individual scripts if they don't exist
  for (const [name, script] of Object.entries(scriptsToAdd)) {
    if (!packageJson.scripts[name]) {
      packageJson.scripts[name] = script;
      updated = true;
      log.success(`Added script: ${name}`);
    }
  }
  
  // Update build script if it doesn't include our steps
  if (packageJson.scripts.build && !packageJson.scripts.build.includes('prerender')) {
    const originalBuild = packageJson.scripts.build;
    packageJson.scripts.build = 'npm run generate-sitemap && ' + originalBuild + ' && npm run copy-htaccess && npm run prerender';
    updated = true;
    log.success('Updated build script to include SSG steps');
  } else if (!packageJson.scripts.build) {
    packageJson.scripts.build = 'npm run generate-sitemap && vite build && npm run copy-htaccess && npm run prerender';
    updated = true;
    log.success('Added build script with SSG support');
  }
  
  if (updated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    log.success('package.json updated');
  } else {
    log.info('package.json scripts already configured');
  }
}

// Detect package manager
function detectPackageManager() {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Check package.json scripts for hints
  const scripts = packageJson.scripts || {};
  const scriptString = JSON.stringify(scripts);

  if (scriptString.includes('pnpm')) {
    return 'pnpm';
  } else if (scriptString.includes('yarn')) {
    return 'yarn';
  } else {
    return 'npm';
  }
}

async function checkDependencies() {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const requiredDevDeps = {
    'puppeteer': '^latest',
    'serve-handler': '^latest',
  };

  const missingDeps = [];

  for (const [dep, version] of Object.entries(requiredDevDeps)) {
    const hasInDev = packageJson.devDependencies?.[dep];
    const hasInProd = packageJson.dependencies?.[dep];

    if (!hasInDev && !hasInProd) {
      missingDeps.push(dep);
    }
  }

  if (missingDeps.length > 0) {
    const packageManager = detectPackageManager();

    log.warning(`Missing dependencies: ${missingDeps.join(', ')}`);
    log.info('Install them with:');

    if (packageManager === 'pnpm') {
      log.info(`  pnpm add -D ${missingDeps.join(' ')}`);
    } else if (packageManager === 'yarn') {
      log.info(`  yarn add -D ${missingDeps.join(' ')}`);
    } else {
      log.info(`  npm install --save-dev ${missingDeps.join(' ')}`);
    }
  } else {
    log.success('All required dependencies are installed');
  }
}

async function copyHtaccess() {
  const sourceHtaccess = path.join(packageRoot, 'templates', '.htaccess');
  const destHtaccess = path.join(projectRoot, 'public', '.htaccess');
  
  // Create public directory if it doesn't exist
  const publicDir = path.join(projectRoot, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    log.success('Created public directory');
  }
  
  // Check if .htaccess template exists in package
  if (fs.existsSync(sourceHtaccess)) {
    if (!fs.existsSync(destHtaccess)) {
      fs.copyFileSync(sourceHtaccess, destHtaccess);
      log.success('Copied .htaccess template to public/');
    } else {
      log.info('.htaccess already exists - skipping');
    }
  } else {
    // Create a basic .htaccess if template doesn't exist
    if (!fs.existsSync(destHtaccess)) {
      const htaccessContent = `# SPA Routing with Static HTML Support
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Enable DirectoryIndex for serving index.html from directories
  DirectoryIndex index.html

  # Add trailing slash to /blog if missing
  RewriteCond %{REQUEST_URI} ^/blog$
  RewriteRule ^(.*)$ /$1/ [R=301,L]

  # Serve static HTML files if they exist (for prerendered blog pages)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_URI} !(.*)/$
  RewriteCond %{REQUEST_FILENAME}/index.html -f
  RewriteRule ^(.*)$ $1/ [R=301,L]

  # Don't rewrite if file or directory exists
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Rewrite everything else to index.html for SPA routing
  RewriteRule ^ /index.html [L]
</IfModule>
`;
      fs.writeFileSync(destHtaccess, htaccessContent);
      log.success('Created .htaccess in public/');
    }
  }
}

async function createExamplePages() {
  const pagesDir = path.join(projectRoot, 'src', 'pages');
  
  // Check if src directory exists
  if (!fs.existsSync(path.join(projectRoot, 'src'))) {
    log.warning('src directory not found - skipping example pages');
    return;
  }
  
  // Create pages directory if it doesn't exist
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
    log.success('Created src/pages directory');
  }
  
  // Only create if they don't exist
  const blogPagePath = path.join(pagesDir, 'Blog.tsx');
  const blogPostPagePath = path.join(pagesDir, 'BlogPost.tsx');
  
  if (!fs.existsSync(blogPagePath)) {
    const blogPageContent = `import { BlogIndex } from 'react-supabase-ssg-blog';
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
`;
    fs.writeFileSync(blogPagePath, blogPageContent);
    log.success('Created src/pages/Blog.tsx');
  }
  
  if (!fs.existsSync(blogPostPagePath)) {
    const blogPostPageContent = `import { BlogArticle } from 'react-supabase-ssg-blog';
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
`;
    fs.writeFileSync(blogPostPagePath, blogPostPageContent);
    log.success('Created src/pages/BlogPost.tsx');
  }
}

async function updateViteConfig() {
  const viteConfigPath = path.join(projectRoot, 'vite.config.ts');
  
  if (!fs.existsSync(viteConfigPath)) {
    log.warning('vite.config.ts not found - skipping');
    log.info('Make sure to configure Vite manually (see DEPLOYMENT_LOCAL.md)');
    return;
  }
  
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Check if already configured
  if (viteConfig.includes('publicDir') && viteConfig.includes('.htaccess')) {
    log.info('vite.config.ts already configured');
    return;
  }
  
  log.warning('vite.config.ts needs manual update');
  log.info('Add the following to your vite.config.ts:');
  log.info('  publicDir: \'public\',');
  log.info('  build: { outDir: \'dist\' }');
  log.info('See DEPLOYMENT_LOCAL.md for details');
}

async function createEnvExample() {
  const envExamplePath = path.join(projectRoot, '.env.example');

  if (fs.existsSync(envExamplePath)) {
    log.info('.env.example already exists');
    return;
  }

  const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Site Configuration
VITE_SITE_URL=https://yourdomain.com
`;

  fs.writeFileSync(envExamplePath, envContent);
  log.success('Created .env.example');
}

async function autoImportCSS() {
  // Find App.tsx or App.jsx
  const possibleAppFiles = [
    path.join(projectRoot, 'src', 'App.tsx'),
    path.join(projectRoot, 'src', 'App.jsx'),
    path.join(projectRoot, 'src', 'app.tsx'),
    path.join(projectRoot, 'src', 'app.jsx'),
  ];

  let appFilePath = null;
  for (const filePath of possibleAppFiles) {
    if (fs.existsSync(filePath)) {
      appFilePath = filePath;
      break;
    }
  }

  if (!appFilePath) {
    log.warning('App.tsx/App.jsx not found - skipping CSS auto-import');
    log.info('Manually add this import to your main app file:');
    log.info('  import "react-supabase-ssg-blog/src/styles/index.css";');
    return;
  }

  let appContent = fs.readFileSync(appFilePath, 'utf8');

  // Check if CSS is already imported
  const cssImportPattern = /import\s+['"]react-supabase-ssg-blog\/src\/styles\/index\.css['"]/;
  if (cssImportPattern.test(appContent)) {
    log.info('CSS already imported in ' + path.basename(appFilePath));
    return;
  }

  // Find the last import statement
  const importLines = appContent.split('\n');
  let lastImportIndex = -1;

  for (let i = 0; i < importLines.length; i++) {
    if (importLines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex === -1) {
    // No imports found, add at the top
    appContent = `import 'react-supabase-ssg-blog/src/styles/index.css';\n\n` + appContent;
  } else {
    // Add after the last import
    importLines.splice(
      lastImportIndex + 1,
      0,
      '',
      '// Blog package default styles',
      `import 'react-supabase-ssg-blog/src/styles/index.css';`
    );
    appContent = importLines.join('\n');
  }

  fs.writeFileSync(appFilePath, appContent);
  log.success(`Auto-imported CSS in ${path.basename(appFilePath)}`);
}

// Run setup
setup().catch(console.error);

