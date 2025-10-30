#!/usr/bin/env node

/**
 * CLI tool for react-supabase-ssg-blog
 * Usage: npx react-supabase-ssg-blog <command>
 */

const { execSync } = require('child_process');
const path = require('path');

const command = process.argv[2];

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function showHelp() {
  console.log(`
${colors.bright}${colors.cyan}React Supabase SSG Blog - CLI${colors.reset}

${colors.bright}Usage:${colors.reset}
  npx react-supabase-ssg-blog <command>

${colors.bright}Commands:${colors.reset}
  ${colors.green}setup${colors.reset}       Run the automated setup wizard
  ${colors.green}help${colors.reset}        Show this help message
  ${colors.green}version${colors.reset}     Show package version

${colors.bright}Examples:${colors.reset}
  npx react-supabase-ssg-blog setup
  npx react-supabase-ssg-blog help

${colors.bright}Documentation:${colors.reset}
  See DEPLOYMENT_LOCAL.md for detailed setup instructions
`);
}

function runSetup() {
  const setupScript = path.join(__dirname, 'postinstall.cjs');
  try {
    execSync(`node "${setupScript}"`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

function showVersion() {
  const packageJson = require('../package.json');
  console.log(`v${packageJson.version}`);
}

switch (command) {
  case 'setup':
    runSetup();
    break;
  case 'version':
    showVersion();
    break;
  case 'help':
  default:
    showHelp();
    break;
}

