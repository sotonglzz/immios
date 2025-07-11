#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get git information
function getGitInfo() {
  try {
    const lastCommitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const lastCommitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
    const lastCommitDate = execSync('git log -1 --pretty=%cd', { encoding: 'utf8' }).trim();
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    
    return {
      hash: lastCommitHash,
      message: lastCommitMessage,
      date: lastCommitDate,
      branch: branch
    };
  } catch (error) {
    console.log('Error getting git info:', error.message);
    return {
      hash: 'unknown',
      message: 'unknown',
      date: new Date().toISOString(),
      branch: 'unknown'
    };
  }
}

// Analyze changes in the last commit
function analyzeChanges() {
  try {
    // Get files changed in the last commit
    const changedFiles = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' })
      .split('\n')
      .filter(file => file.trim());
    
    // Get diff stats
    const diffStats = execSync('git diff --stat HEAD~1 HEAD', { encoding: 'utf8' });
    
    // Categorize changes
    const categories = {
      features: [],
      fixes: [],
      docs: [],
      config: [],
      tests: [],
      other: []
    };
    
    changedFiles.forEach(file => {
      if (file.includes('test') || file.includes('spec')) {
        categories.tests.push(file);
      } else if (file.includes('README') || file.includes('.md') || file.includes('docs')) {
        categories.docs.push(file);
      } else if (file.includes('package.json') || file.includes('config') || file.includes('.env')) {
        categories.config.push(file);
      } else if (file.includes('fix') || file.includes('bug') || file.includes('error')) {
        categories.fixes.push(file);
      } else if (file.includes('feat') || file.includes('feature') || file.includes('component')) {
        categories.features.push(file);
      } else {
        categories.other.push(file);
      }
    });
    
    return {
      changedFiles,
      diffStats,
      categories
    };
  } catch (error) {
    console.log('Error analyzing changes:', error.message);
    return {
      changedFiles: [],
      diffStats: '',
      categories: {
        features: [],
        fixes: [],
        docs: [],
        config: [],
        tests: [],
        other: []
      }
    };
  }
}

// Update TASK.md with completed tasks
function updateTaskFile() {
  const taskFile = 'TASK.md';
  if (!fs.existsSync(taskFile)) {
    console.log('TASK.md not found, skipping task updates');
    return;
  }
  
  try {
    let taskContent = fs.readFileSync(taskFile, 'utf8');
    
    // Get the last commit message to identify completed tasks
    const { message } = getGitInfo();
    
    // Simple task completion detection based on commit message
    const completedTasks = [];
    
    if (message.includes('setup') || message.includes('initialize')) {
      completedTasks.push('Project setup and environment configuration');
    }
    if (message.includes('auth') || message.includes('login')) {
      completedTasks.push('Authentication system implementation');
    }
    if (message.includes('database') || message.includes('firestore')) {
      completedTasks.push('Database schema implementation');
    }
    if (message.includes('ui') || message.includes('component')) {
      completedTasks.push('Basic UI framework creation');
    }
    if (message.includes('real-time') || message.includes('websocket')) {
      completedTasks.push('Real-time setup');
    }
    
    // Update task completion status
    completedTasks.forEach(task => {
      const taskRegex = new RegExp(`- \\[ \\] \\*\\*${task.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*`, 'g');
      taskContent = taskContent.replace(taskRegex, `- [x] **${task}**`);
    });
    
    fs.writeFileSync(taskFile, taskContent);
    console.log('TASK.md updated with completed tasks');
    
    return completedTasks;
  } catch (error) {
    console.log('Error updating TASK.md:', error.message);
    return [];
  }
}

// Update HISTORY.md with detailed information
function updateHistory(version, action = 'push') {
  const historyFile = 'HISTORY.md';
  const timestamp = new Date().toISOString();
  
  // Get current version
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const currentVersion = packageJson.version;
  
  // Get git information
  const gitInfo = getGitInfo();
  const changes = analyzeChanges();
  const completedTasks = updateTaskFile();
  
  let historyContent = '';
  if (fs.existsSync(historyFile)) {
    historyContent = fs.readFileSync(historyFile, 'utf8');
  } else {
    historyContent = `# IMMIOS Version History

This document tracks all version changes and work completed in the IMMIOS project.

## Version History

`;
  }
  
  // Create detailed entry
  const entry = `### v${currentVersion} - ${timestamp}

**Action**: ${action}
**Branch**: ${gitInfo.branch}
**Commit Hash**: ${gitInfo.hash.substring(0, 8)}
**Commit Message**: ${gitInfo.message}
**Commit Date**: ${gitInfo.date}

**Files Changed**: ${changes.changedFiles.length} files
${changes.changedFiles.map(file => `- ${file}`).join('\n')}

**Change Categories**:
${changes.categories.features.length > 0 ? `- **Features**: ${changes.categories.features.join(', ')}` : ''}
${changes.categories.fixes.length > 0 ? `- **Fixes**: ${changes.categories.fixes.join(', ')}` : ''}
${changes.categories.docs.length > 0 ? `- **Documentation**: ${changes.categories.docs.join(', ')}` : ''}
${changes.categories.config.length > 0 ? `- **Configuration**: ${changes.categories.config.join(', ')}` : ''}
${changes.categories.tests.length > 0 ? `- **Tests**: ${changes.categories.tests.join(', ')}` : ''}
${changes.categories.other.length > 0 ? `- **Other**: ${changes.categories.other.join(', ')}` : ''}

**Tasks Completed**:
${completedTasks.length > 0 ? completedTasks.map(task => `- [x] ${task}`).join('\n') : '- [ ] Auto-versioning system updated'}

**Work Summary**:
- Version ${currentVersion} ${action === 'push' ? 'pushed to repository' : 'committed locally'}
- ${changes.changedFiles.length} files modified
- ${completedTasks.length} tasks completed

---

`;
  
  // Insert new entry at the top (after the header)
  const headerEndIndex = historyContent.indexOf('## Version History') + '## Version History'.length;
  const newContent = historyContent.slice(0, headerEndIndex) + '\n' + entry + historyContent.slice(headerEndIndex);
  
  fs.writeFileSync(historyFile, newContent);
  console.log(`HISTORY.md updated with detailed information for version ${currentVersion}`);
}

// Main function
function main() {
  try {
    const action = process.argv[2] || 'push';
    updateHistory(null, action);
  } catch (error) {
    console.error('Error updating history:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { updateHistory, getGitInfo, analyzeChanges, updateTaskFile }; 