/**
 * Example: Sitemap XML Endpoint
 * 
 * This file shows how to create a sitemap.xml endpoint for your blog.
 * Copy this to your project and adjust the paths as needed.
 * 
 * For Express.js:
 * Place this in your routes folder and import it in your main server file.
 * 
 * For Next.js:
 * Place this in pages/api/sitemap.xml.ts or app/sitemap.xml/route.ts
 */

import { createClient } from '@supabase/supabase-js';
import { generateSitemapXML } from 'react-supabase-ssg-blog';

// ============================================================================
// EXPRESS.JS EXAMPLE
// ============================================================================

/**
 * Express.js route handler for sitemap.xml
 * 
 * Usage:
 * import { sitemapHandler } from './routes/sitemap';
 * app.get('/sitemap.xml', sitemapHandler);
 */
export async function sitemapHandler(req: any, res: any) {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    // Get your site's base URL
    const baseUrl = process.env.SITE_URL || 'https://yourdomain.com';

    // Generate sitemap XML
    const sitemapXML = await generateSitemapXML(supabase, baseUrl);

    // Set proper headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Send XML response
    res.send(sitemapXML);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}

// ============================================================================
// NEXT.JS APP ROUTER EXAMPLE (Next.js 13+)
// ============================================================================

/**
 * Next.js App Router sitemap handler
 * 
 * Place this file at: app/sitemap.xml/route.ts
 * 
 * The sitemap will be available at: https://yourdomain.com/sitemap.xml
 */
export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const { generateSitemapXML } = await import('react-supabase-ssg-blog');

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get your site's base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

    // Generate sitemap XML
    const sitemapXML = await generateSitemapXML(supabase, baseUrl);

    // Return XML response with proper headers
    return new Response(sitemapXML, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}

// ============================================================================
// NEXT.JS PAGES ROUTER EXAMPLE (Next.js 12 and below)
// ============================================================================

/**
 * Next.js Pages Router sitemap handler
 * 
 * Place this file at: pages/api/sitemap.xml.ts
 * 
 * Then add a rewrite in next.config.js:
 * 
 * module.exports = {
 *   async rewrites() {
 *     return [
 *       {
 *         source: '/sitemap.xml',
 *         destination: '/api/sitemap.xml',
 *       },
 *     ];
 *   },
 * };
 */
export default async function handler(req: any, res: any) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const { generateSitemapXML } = await import('react-supabase-ssg-blog');

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get your site's base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

    // Generate sitemap XML
    const sitemapXML = await generateSitemapXML(supabase, baseUrl);

    // Set proper headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Send XML response
    res.status(200).send(sitemapXML);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}

// ============================================================================
// STATIC GENERATION EXAMPLE (Build Time)
// ============================================================================

/**
 * Generate sitemap.xml at build time
 * 
 * Add this script to your package.json:
 * "scripts": {
 *   "generate-sitemap": "node scripts/generate-sitemap.js"
 * }
 * 
 * Then run it as part of your build process:
 * "build": "npm run generate-sitemap && react-scripts build"
 */

// File: scripts/generate-sitemap.js
/*
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { generateSitemapXML } = require('react-supabase-ssg-blog');

async function generateSitemap() {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.REACT_APP_SUPABASE_ANON_KEY
    );

    // Get your site's base URL
    const baseUrl = process.env.REACT_APP_SITE_URL || 'https://yourdomain.com';

    // Generate sitemap XML
    const sitemapXML = await generateSitemapXML(supabase, baseUrl);

    // Write to public/sitemap.xml
    const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemapXML, 'utf8');

    console.log('✅ Sitemap generated successfully at public/sitemap.xml');
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
*/

// ============================================================================
// CONFIGURATION OPTIONS
// ============================================================================

/**
 * Advanced configuration example
 */
export async function advancedSitemapHandler(req: any, res: any) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const { generateSitemapXML } = await import('react-supabase-ssg-blog');

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const baseUrl = process.env.SITE_URL || 'https://yourdomain.com';

    // Generate sitemap with custom options
    const sitemapXML = await generateSitemapXML(
      supabase,
      baseUrl,
      'blog_articles', // Custom table name
      true // Include blog index page
    );

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(sitemapXML);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}

