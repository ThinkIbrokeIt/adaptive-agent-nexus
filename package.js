#!/usr/bin/env node

/**
 * Adaptive Agent Nexus - Packaging Helper
 * Helps with building and packaging the application for different platforms
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Adaptive Agent Nexus - Multi-Platform Packaging Tool');
console.log('====================================================\n');

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'build':
    console.log('📦 Building web application...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Web build complete\n');
    break;

  case 'electron':
    console.log('🖥️  Building Electron desktop applications...');
    execSync('npm run build:electron', { stdio: 'inherit' });
    console.log('✅ Desktop builds complete\n');
    break;

  case 'all':
    console.log('🌍 Building for all platforms...');
    execSync('npm run dist', { stdio: 'inherit' });
    console.log('✅ All builds complete\n');
    break;

  case 'dev':
    console.log('🔧 Starting development environment...');
    console.log('Web server will start on http://localhost:8080');
    console.log('Electron app will connect to the dev server');
    console.log('Press Ctrl+C to stop\n');
    execSync('npm run electron:dev', { stdio: 'inherit' });
    break;

  case 'status':
    console.log('📊 Build Status:');
    const distExists = fs.existsSync(path.join(__dirname, 'dist'));
    const electronDistExists = fs.existsSync(path.join(__dirname, 'dist-electron'));

    console.log(`Web Build: ${distExists ? '✅ Ready' : '❌ Not built'}`);
    console.log(`Desktop Builds: ${electronDistExists ? '✅ Ready' : '❌ Not built'}`);

    if (electronDistExists) {
      const files = fs.readdirSync(path.join(__dirname, 'dist-electron'));
      console.log('\n📁 Generated files:');
      files.forEach(file => console.log(`  - ${file}`));
    }
    console.log('');
    break;

  default:
    console.log('Usage: node package.js <command>');
    console.log('');
    console.log('Commands:');
    console.log('  build     - Build web application only');
    console.log('  electron  - Build desktop applications only');
    console.log('  all       - Build web + all desktop platforms');
    console.log('  dev       - Start development environment');
    console.log('  status    - Check build status');
    console.log('');
    console.log('Examples:');
    console.log('  node package.js all        # Build everything');
    console.log('  node package.js electron   # Desktop apps only');
    console.log('  node package.js dev        # Development mode');
    break;
}