/**
 * Generate sitemap.xml for the blog
 * 
 * This script generates a sitemap.xml file at build time
 * Run this before building your app:
 * 
 * npm run generate-sitemap
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

async function generateSitemap() {
  try {
    console.log('🚀 Generating sitemap.xml...');

    // Initialize Supabase client
    // Use the actual Supabase URL from the client config
    const supabaseUrl = 'https://jecfmpvnvpnblzkxqjys.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplY2ZtcHZudnBuYmx6a3hxanlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTIzMTAsImV4cCI6MjA2Nzk4ODMxMH0.FSt7LAt4H6RBAJXepBy68vnXNoEMiWBQQrEUMX8Si2Q';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials. Check your .env file.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get your site's base URL
    const baseUrl = process.env.VITE_SITE_URL || 'http://localhost:8080';

    console.log(`📍 Base URL: ${baseUrl}`);

    // Fetch all published blog articles
    const { data: articles, error } = await supabase
      .from('blog_articles')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching articles: ${error.message}`);
    }

    console.log(`📝 Found ${articles?.length || 0} published articles`);

    // Start XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add homepage
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += '  </url>\n';

    // Add blog index page
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/blog</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += '  </url>\n';

    // Add article pages
    if (articles && articles.length > 0) {
      for (const article of articles) {
        const lastmod = article.updated_at || article.published_at;
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/blog/${escapeXml(article.slug)}</loc>\n`;
        xml += `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += '  </url>\n';
      }
    }

    // Add other important pages
    const staticPages = [
      { path: '/categories', priority: '0.8' },
      { path: '/how-it-works', priority: '0.7' },
      { path: '/help-center', priority: '0.7' },
      { path: '/contact', priority: '0.6' },
      { path: '/privacy-policy', priority: '0.5' },
      { path: '/terms-of-service', priority: '0.5' },
    ];

    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    // Close XML
    xml += '</urlset>';

    // Write to public/sitemap.xml (go up 3 levels from package scripts folder)
    const outputPath = path.join(__dirname, '..', '..', '..', 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');

    console.log('✅ Sitemap generated successfully at public/sitemap.xml');
    console.log(`📊 Total URLs: ${(articles?.length || 0) + staticPages.length + 2}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    process.exit(1);
  }
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Run the script
generateSitemap();

