# IMMIOS - Instant Marquees Melbourne Internal Operations Software

## Project Overview

IMMIOS is an internal operations management system for Instant Marquees Melbourne, designed to centralize and streamline key operational processes including job scheduling, stock management, staff management, and vehicle management.

## Auto-Versioning System

This project includes an automated versioning system that tracks all changes and maintains comprehensive documentation.

### How It Works

1. **On Git Commit**: 
   - Automatically analyzes commit messages and changed files
   - Determines appropriate version bump (major/minor/patch)
   - Updates `package.json` version
   - Creates git tags
   - Updates `HISTORY.md` with basic information

2. **On Git Push**:
   - Analyzes detailed git information
   - Categorizes changes (features, fixes, docs, etc.)
   - Updates `TASK.md` with completed tasks
   - Updates `HISTORY.md` with detailed work information

### Version Bump Rules

- **Major** (x.0.0): Breaking changes, major architecture changes
- **Minor** (0.x.0): New features, significant improvements  
- **Patch** (0.0.x): Bug fixes, minor improvements, documentation

### Commit Message Conventions

Use these keywords in commit messages to trigger appropriate version bumps:

- `[major]` or `BREAKING CHANGE`: Major version bump
- `[minor]` or `feat:`: Minor version bump
- `[patch]` or `fix:`: Patch version bump
- Default: Patch version bump

## Project Structure

```
IMMIOS/
├── Documentation/          # Original PDF documentation
├── scripts/               # Auto-versioning scripts
│   ├── auto-version.js    # Version management
│   └── update-history.js  # History tracking
├── PLANNING.md           # High-level vision & architecture
├── TASK.md              # Task tracking & progress
├── HISTORY.md           # Complete version history
├── package.json         # Project configuration
└── README.md           # This file
```

## Development Setup

### Prerequisites

- Node.js 18.x or later
- Git
- Firebase CLI (for Firestore)
- Vercel CLI (for deployment)

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Firebase project
4. Configure environment variables
5. Start development: `npm run dev`

## Tech Stack

- **Frontend**: Next.js 14+ (React), TypeScript, Tailwind CSS
- **Backend**: Node.js via Next.js API Routes
- **Database**: Firestore (Firebase)
- **Real-time**: WebSockets (Socket.IO)
- **Deployment**: Vercel
- **Development**: Cursor AI

## Documentation

- **PLANNING.md**: High-level vision, architecture, constraints, tech stack
- **TASK.md**: Current tasks, backlog, milestones, progress tracking
- **HISTORY.md**: Complete version history with detailed work information
- **Documentation/**: Original PDF documentation files

## Development Phases

1. **Phase 1: Foundation** (Weeks 1-4) - Project setup, authentication, basic UI
2. **Phase 2: Core Features** (Weeks 5-8) - Job management, stock management, staff management
3. **Phase 3: Real-time & Polish** (Weeks 9-12) - WebSockets, offline functionality, optimization
4. **Phase 4: Testing & Deployment** (Weeks 13-16) - Testing, deployment, user training

## Auto-Versioning Files

- **HISTORY.md**: Tracks all version changes with timestamps and detailed work information
- **TASK.md**: Automatically updated with completed tasks based on commit messages
- **package.json**: Version number automatically updated
- **Git tags**: Automatic version tagging

## Getting Started

1. Review `PLANNING.md` for project architecture and guidelines
2. Check `TASK.md` for current development tasks
3. Review `HISTORY.md` for recent changes and progress
4. Follow the development phases outlined in the documentation

---

**Note**: This project uses an automated versioning system. All commits and pushes will automatically update version numbers and documentation. See `HISTORY.md` for complete version history. 