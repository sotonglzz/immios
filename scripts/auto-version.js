#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the current version from package.json
function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

// Parse version string into components
function parseVersion(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major, minor, patch };
}

// Update version in package.json
function updateVersion(newVersion) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log(`Version updated to ${newVersion}`);
}

// Get commit message and analyze for version bump type
function analyzeCommit() {
  try {
    // Get the last commit message
    const lastCommitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
    
    // Get files changed in the last commit
    const changedFiles = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' })
      .split('\n')
      .filter(file => file.trim());
    
    console.log('Last commit message:', lastCommitMessage);
    console.log('Changed files:', changedFiles);
    
    // Determine version bump type based on commit message and files changed
    let bumpType = 'patch'; // default
    
    // Check for breaking changes
    if (lastCommitMessage.includes('BREAKING CHANGE') || 
        lastCommitMessage.includes('breaking change') ||
        lastCommitMessage.includes('[major]') ||
        lastCommitMessage.includes('[breaking]')) {
      bumpType = 'major';
    }
    // Check for new features
    else if (lastCommitMessage.includes('feat:') ||
             lastCommitMessage.includes('feature:') ||
             lastCommitMessage.includes('[minor]') ||
             lastCommitMessage.includes('[feature]')) {
      bumpType = 'minor';
    }
    // Check for specific file changes that might indicate major changes
    else if (changedFiles.some(file => 
      file.includes('package.json') || 
      file.includes('PLANNING.md') ||
      file.includes('architecture') ||
      file.includes('database') ||
      file.includes('auth'))) {
      bumpType = 'minor';
    }
    
    return { bumpType, commitMessage: lastCommitMessage, changedFiles };
  } catch (error) {
    console.log('Error analyzing commit:', error.message);
    return { bumpType: 'patch', commitMessage: 'Unknown', changedFiles: [] };
  }
}

// Calculate new version based on bump type
function calculateNewVersion(currentVersion, bumpType) {
  const { major, minor, patch } = parseVersion(currentVersion);
  
  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

// Main function
function main() {
  try {
    const currentVersion = getCurrentVersion();
    console.log(`Current version: ${currentVersion}`);
    
    const { bumpType, commitMessage, changedFiles } = analyzeCommit();
    console.log(`Detected bump type: ${bumpType}`);
    
    const newVersion = calculateNewVersion(currentVersion, bumpType);
    console.log(`New version: ${newVersion}`);
    
    // Update package.json
    updateVersion(newVersion);
    
    // Create git tag for the new version
    try {
      execSync(`git tag -a v${newVersion} -m "Version ${newVersion} - ${commitMessage}"`, { stdio: 'inherit' });
      console.log(`Git tag v${newVersion} created`);
    } catch (error) {
      console.log('Warning: Could not create git tag:', error.message);
    }
    
    // Update HISTORY.md
    updateHistory(newVersion, commitMessage, changedFiles, bumpType);
    
  } catch (error) {
    console.error('Error in auto-versioning:', error);
    process.exit(1);
  }
}

// Update HISTORY.md with the new version information
function updateHistory(version, commitMessage, changedFiles, bumpType) {
  const historyFile = 'HISTORY.md';
  const timestamp = new Date().toISOString();
  
  let historyContent = '';
  if (fs.existsSync(historyFile)) {
    historyContent = fs.readFileSync(historyFile, 'utf8');
  } else {
    historyContent = `# IMMIOS Version History

This document tracks all version changes and work completed in the IMMIOS project.

## Version History

`;
  }
  
  // Create new version entry
  const versionEntry = `### v${version} - ${timestamp}

**Bump Type**: ${bumpType}
**Commit Message**: ${commitMessage}
**Changed Files**: ${changedFiles.length} files
${changedFiles.map(file => `- ${file}`).join('\n')}

**Work Completed**:
- [ ] Auto-versioning system implemented
- [ ] Version ${version} created

---

`;
  
  // Insert new entry at the top (after the header)
  const headerEndIndex = historyContent.indexOf('## Version History') + '## Version History'.length;
  const newContent = historyContent.slice(0, headerEndIndex) + '\n' + versionEntry + historyContent.slice(headerEndIndex);
  
  fs.writeFileSync(historyFile, newContent);
  console.log(`HISTORY.md updated with version ${version}`);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, updateHistory, analyzeCommit, calculateNewVersion }; 