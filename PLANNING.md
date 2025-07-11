# IMMIOS - Instant Marquees Melbourne Internal Operations Software

## Project Vision

**Purpose**: Centralize and streamline key operational processes for Instant Marquees Melbourne, including job scheduling, stock management, staff management, and vehicle management.

**Target**: Internal use only, focusing on improving efficiency, accuracy, and communication within the team.

**Business Context**: 
- Events Logistics industry specializing in marquee, umbrella, and furniture rentals
- Target market: Council/government-run public events requiring multiple smaller marquees
- USP: Quick response, fast installation, large stock quantity enabling single-vendor solutions
- Focus: "Instant Pop-up Marquees" for quick installation/removal

## Architecture Overview

### High-Level Architecture
```
User Browser (React Frontend)
    ↓ HTTP Requests
Next.js Application (Frontend + API Routes)
    ↓ API Calls
Firestore Database
    ↓ Real-time Data Sync
WebSocket Server (Node.js/Socket.IO)
    ↓ Pushes Updates
User Browser (Real-time Updates)
```

### Key Architectural Decisions

**Next.js**: 
- React framework benefits (component-based UI)
- Server-side rendering (SSR) for initial page load performance
- API routes for integrated backend logic
- Excellent Vercel deployment support

**Node.js (via Next.js API Routes)**:
- Unified JavaScript environment for both frontend and backend
- Serverless functions for scalability
- Real-time capabilities via WebSockets

**Firestore**:
- Real-time database with automatic synchronization
- NoSQL structure for flexible data modeling
- Built-in authentication and security rules
- Offline capability for critical functions

**WebSockets**:
- Granular, live updates across connected clients
- Real-time job status updates
- Live stock availability changes
- Instant staff assignment notifications

## Tech Stack

### Frontend
- **Next.js 14+** (React framework)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **React Query/TanStack Query** for data fetching
- **Socket.IO Client** for real-time updates

### Backend
- **Next.js API Routes** (Node.js)
- **Socket.IO** for WebSocket server
- **Firebase Admin SDK** for Firestore operations
- **Firebase Auth** for authentication

### Database
- **Firestore** (Firebase)
- **Real-time listeners** for live updates
- **Offline persistence** for critical functions

### Deployment & Tools
- **Vercel** for hosting and deployment
- **Firebase CLI** for Firestore management
- **Cursor AI** for code generation
- **Git** for version control

## Data Model

### Core Collections

**users**
- email, password, role (admin/staff), staffId, createdAt, lastLoginAt

**staff**
- name, contactInfo, notes, availability, linkedUserId, createdAt, updatedAt

**products**
- name, description, category, components[], stockLevel, minStockLevel, createdAt, updatedAt

**jobs**
- clientDetails, dates, location, products[], status (quote/job), assignedStaff[], assignedVehicles[], notes, createdAt, updatedAt

**vehicles**
- name, type, registration, maintenanceSchedule, availability, assignedJobs[], createdAt, updatedAt

**components**
- name, description, category, stockLevel, minStockLevel, usedInProducts[], createdAt, updatedAt

## Development Constraints

### Performance Requirements
- **Page load time**: < 3 seconds initial load
- **Real-time updates**: < 500ms latency
- **Offline capability**: Critical functions must work without internet
- **Mobile responsiveness**: Must work on tablets and phones

### Security Requirements
- **Authentication**: Secure login/logout for all users
- **Authorization**: Role-based access control (Admin/Staff)
- **Data validation**: Server-side validation for all inputs
- **Firestore security rules**: Proper read/write permissions

### Scalability Considerations
- **Serverless architecture**: Automatic scaling with Vercel
- **Database optimization**: Efficient queries and indexing
- **Real-time limits**: Manage WebSocket connections efficiently
- **Offline sync**: Handle data conflicts gracefully

## Development Guidelines

### Code Organization
```
src/
├── components/          # Reusable UI components
├── pages/              # Next.js pages and API routes
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── services/           # Business logic and API calls
├── styles/             # Global styles and Tailwind config
└── firebase/           # Firebase configuration and helpers
```

### Coding Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Component structure**: Functional components with hooks
- **Error handling**: Comprehensive error boundaries and logging
- **Testing**: Unit tests for critical business logic

### Real-time Implementation
- **WebSocket connections**: Manage connection lifecycle
- **Data synchronization**: Handle conflicts and offline scenarios
- **Performance**: Optimize for multiple concurrent users
- **Fallbacks**: Graceful degradation when real-time fails

## Deployment Strategy

### Environment Setup
1. **Development**: Local Next.js server with Firebase emulators
2. **Staging**: Vercel preview deployments
3. **Production**: Vercel production deployment

### CI/CD Pipeline
- **Git workflow**: Feature branches → PR → Merge to main
- **Automatic deployment**: Vercel auto-deploys on main branch
- **Environment variables**: Secure management of API keys
- **Database migrations**: Firestore security rules and indexes

## Success Metrics

### Technical Metrics
- **Uptime**: 99.9% availability
- **Performance**: < 3s page load, < 500ms real-time updates
- **Error rate**: < 1% of user interactions
- **Offline functionality**: 100% of critical features

### Business Metrics
- **User adoption**: 100% of staff using system within 2 weeks
- **Efficiency gains**: 30% reduction in job scheduling time
- **Error reduction**: 50% fewer booking conflicts
- **Real-time coordination**: Instant updates across all team members

## Risk Mitigation

### Technical Risks
- **Real-time complexity**: Start with basic WebSocket implementation
- **Offline sync conflicts**: Implement clear conflict resolution strategy
- **Performance with large datasets**: Optimize queries and pagination
- **Mobile responsiveness**: Test on actual devices early

### Business Risks
- **User adoption**: Provide comprehensive training and support
- **Data migration**: Plan for existing data import
- **Feature scope creep**: Stick to MVP requirements initially
- **Timeline delays**: Build buffer time into development schedule

## Development Phases

### Phase 1: Foundation (Weeks 1-4)
- Project setup and environment configuration
- Authentication system
- Basic user management
- Core database structure

### Phase 2: Core Features (Weeks 5-8)
- Job management and calendar interface
- Basic stock management
- Staff management
- Vehicle management

### Phase 3: Real-time & Polish (Weeks 9-12)
- WebSocket implementation
- Real-time updates
- Offline functionality
- Performance optimization

### Phase 4: Testing & Deployment (Weeks 13-16)
- Comprehensive testing
- User training materials
- Production deployment
- Go-live support

---

**Reference this document at the beginning of any new conversation to maintain architectural consistency and development standards.** 