#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read version from package.json
function getPackageVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

// Create or update .env.local with the current version
function updateVersionEnv() {
  const version = getPackageVersion();
  const envPath = '.env.local';
  
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Remove existing NEXT_PUBLIC_APP_VERSION if it exists
  const lines = envContent.split('\n').filter(line => !line.startsWith('NEXT_PUBLIC_APP_VERSION='));
  
  // Add the new version
  lines.push(`NEXT_PUBLIC_APP_VERSION=${version}`);
  
  // Write back to file
  fs.writeFileSync(envPath, lines.join('\n') + '\n');
  
  console.log(`Updated .env.local with version ${version}`);
}

// Main function
function main() {
  try {
    updateVersionEnv();
  } catch (error) {
    console.error('Error updating version env:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { updateVersionEnv, getPackageVersion }; 