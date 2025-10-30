/**
 * Prerender Blog Pages for Static Site Generation (SSG)
 * 
 * This script generates static HTML files for all blog routes at build time.
 * It uses Puppeteer to render each page and save the HTML to the dist folder.
 * 
 * Usage:
 *   node packages/react-supabase-ssg-blog/scripts/prerender.cjs
 * 
 * Requirements:
 *   - puppeteer (installed as dev dependency)
 *   - Built Vite app in dist folder
 *   - Supabase credentials in environment
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const http = require('http');
const handler = require('serve-handler');

// Load environment variables
require('dotenv').config();

// Configuration
const CONFIG = {
  distDir: path.join(__dirname, '..', '..', '..', 'dist'),
  port: 3000,
  baseUrl: 'http://localhost:3000',
  supabaseUrl: 'https://jecfmpvnvpnblzkxqjys.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplY2ZtcHZudnBuYmx6a3hxanlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTIzMTAsImV4cCI6MjA2Nzk4ODMxMH0.FSt7LAt4H6RBAJXepBy68vnXNoEMiWBQQrEUMX8Si2Q',
  timeout: 30000, // 30 seconds per page
  waitForSelector: '#root', // Wait for React root to render
  parallelPages: 5, // Number of pages to render in parallel (adjust based on your system)
  maxRetries: 2, // Retry failed pages
};

/**
 * Start a local HTTP server to serve the built app
 */
function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      return handler(request, response, {
        public: CONFIG.distDir,
        cleanUrls: false,
        rewrites: [
          { source: '/blog/**', destination: '/index.html' },
          { source: '**', destination: '/index.html' }
        ]
      });
    });

    server.listen(CONFIG.port, () => {
      console.log(`✅ Server running at ${CONFIG.baseUrl}`);
      resolve(server);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${CONFIG.port} is in use, trying ${CONFIG.port + 1}...`);
        CONFIG.port++;
        CONFIG.baseUrl = `http://localhost:${CONFIG.port}`;
        server.close();
        resolve(startServer());
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Fetch all published blog article slugs from Supabase
 */
async function getBlogSlugs() {
  try {
    console.log('📡 Fetching blog articles from Supabase...');
    
    const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
    
    const { data: articles, error } = await supabase
      .from('blog_articles')
      .select('slug')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching articles:', error.message);
      return [];
    }

    const slugs = articles?.map(a => a.slug) || [];
    console.log(`✅ Found ${slugs.length} published articles`);
    
    return slugs;
  } catch (error) {
    console.error('❌ Error in getBlogSlugs:', error.message);
    return [];
  }
}

/**
 * Prerender a single page using Puppeteer
 */
async function prerenderPage(browser, url, outputPath) {
  const page = await browser.newPage();
  
  try {
    console.log(`  🔄 Rendering: ${url}`);
    
    // Navigate to the page
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: CONFIG.timeout
    });

    // Wait for React to render
    await page.waitForSelector(CONFIG.waitForSelector, {
      timeout: CONFIG.timeout
    });

    // Additional wait for dynamic content
    await page.evaluate(() => {
      return new Promise((resolve) => {
        // Wait for any pending state updates
        setTimeout(resolve, 1000);
      });
    });

    // Get the rendered HTML
    const html = await page.content();

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write HTML to file
    fs.writeFileSync(outputPath, html, 'utf8');
    
    console.log(`  ✅ Saved: ${outputPath}`);
    
    return true;
  } catch (error) {
    console.error(`  ❌ Error rendering ${url}:`, error.message);
    return false;
  } finally {
    await page.close();
  }
}

/**
 * Process a batch of routes in parallel
 */
async function processBatch(browser, routes, batchNumber, totalBatches) {
  const results = await Promise.all(
    routes.map(async (route) => {
      const url = `${CONFIG.baseUrl}${route.url}`;
      const outputPath = path.join(CONFIG.distDir, route.output);

      let success = false;
      let retries = 0;

      while (!success && retries <= CONFIG.maxRetries) {
        if (retries > 0) {
          console.log(`  🔄 Retry ${retries}/${CONFIG.maxRetries}: ${route.url}`);
        }

        success = await prerenderPage(browser, url, outputPath);

        if (!success) {
          retries++;
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return { route, success };
    })
  );

  return results;
}

/**
 * Main prerender function with parallel processing
 */
async function prerender() {
  let server = null;
  let browser = null;

  try {
    console.log('\n🚀 Starting Blog Prerendering Process (Parallel Mode)...\n');

    // Check if dist folder exists
    if (!fs.existsSync(CONFIG.distDir)) {
      throw new Error(`Dist folder not found: ${CONFIG.distDir}\nPlease run 'npm run build' first.`);
    }

    // Start local server
    console.log('📦 Starting local server...');
    server = await startServer();

    // Import Puppeteer dynamically
    console.log('🌐 Launching browser...');
    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Overcome limited resource problems
        '--disable-gpu',
      ]
    });

    // Get blog slugs
    const slugs = await getBlogSlugs();

    // Define routes to prerender
    const routes = [
      { url: '/blog', output: 'blog/index.html' },
      ...slugs.map(slug => ({
        url: `/blog/${slug}`,
        output: `blog/${slug}/index.html`
      }))
    ];

    console.log(`\n📝 Prerendering ${routes.length} pages (${CONFIG.parallelPages} at a time)...\n`);

    const startTime = Date.now();

    // Split routes into batches for parallel processing
    const batches = [];
    for (let i = 0; i < routes.length; i += CONFIG.parallelPages) {
      batches.push(routes.slice(i, i + CONFIG.parallelPages));
    }

    let successCount = 0;
    let failCount = 0;
    const failedRoutes = [];

    // Process batches sequentially, but pages within each batch in parallel
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchNumber = i + 1;

      console.log(`📦 Batch ${batchNumber}/${batches.length} (${batch.length} pages)...`);

      const results = await processBatch(browser, batch, batchNumber, batches.length);

      results.forEach(({ route, success }) => {
        if (success) {
          successCount++;
        } else {
          failCount++;
          failedRoutes.push(route.url);
        }
      });

      console.log(`✅ Batch ${batchNumber} complete\n`);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n✨ Prerendering Complete!\n');
    console.log(`✅ Success: ${successCount} pages`);
    console.log(`❌ Failed: ${failCount} pages`);
    console.log(`📊 Total: ${routes.length} pages`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`🚀 Speed: ${(routes.length / duration).toFixed(2)} pages/second\n`);

    if (failedRoutes.length > 0) {
      console.log('❌ Failed routes:');
      failedRoutes.forEach(url => console.log(`   - ${url}`));
      console.log('');
    }

    // Create a summary file
    const summary = {
      timestamp: new Date().toISOString(),
      totalPages: routes.length,
      successCount,
      failCount,
      failedRoutes,
      duration: `${duration}s`,
      speed: `${(routes.length / duration).toFixed(2)} pages/second`,
      parallelPages: CONFIG.parallelPages,
      routes: routes.map(r => r.url)
    };

    fs.writeFileSync(
      path.join(CONFIG.distDir, 'prerender-summary.json'),
      JSON.stringify(summary, null, 2),
      'utf8'
    );

    console.log('📄 Summary saved to dist/prerender-summary.json\n');

  } catch (error) {
    console.error('\n❌ Prerendering failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Cleanup
    if (browser) {
      console.log('🔒 Closing browser...');
      await browser.close();
    }
    
    if (server) {
      console.log('🔒 Stopping server...');
      server.close();
    }
    
    console.log('✅ Cleanup complete\n');
  }
}

// Run the prerender script
if (require.main === module) {
  prerender().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { prerender, getBlogSlugs };

