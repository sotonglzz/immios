# Database Setup Guide for IMMIOS

This guide will walk you through setting up Firebase Firestore as the database for the IMMIOS project.

## Prerequisites

- Node.js 18+ installed
- Firebase account (free tier is sufficient)
- Git installed

## Step 1: Create Firebase Project

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create a new project**:
   - Click "Add project"
   - Name it "Instant Marquees App" (or your preferred name)
   - Follow the setup wizard
   - Choose your preferred location (e.g., `asia-southeast2` for Melbourne)

## Step 2: Enable Firestore Database

1. **In your Firebase project console**:
   - Go to "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in production mode" (we'll configure security rules later)
   - Select a location (e.g., `asia-southeast2`)
   - Click "Done"

## Step 3: Enable Authentication

1. **In your Firebase project console**:
   - Go to "Authentication" in the left sidebar
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Email/Password" provider
   - Click "Save"

## Step 4: Get Firebase Configuration

1. **In your Firebase project console**:
   - Go to "Project settings" (gear icon next to "Project overview")
   - Scroll down to "Your apps" section
   - Click the web icon (`</>`) to add a web app
   - Register your app with a nickname (e.g., "IMMIOS Web App")
   - Copy the `firebaseConfig` object

## Step 5: Configure Environment Variables

1. **Create `.env.local` file** in the project root:
   ```bash
   # Copy from env.example and replace with your actual values
   cp env.example .env.local
   ```

2. **Replace the placeholder values** in `.env.local` with your actual Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="your_actual_api_key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project_id.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
   ```

## Step 6: Install Dependencies

```bash
npm install
```

## Step 7: Deploy Firestore Security Rules

1. **Login to Firebase CLI**:
   ```bash
   npx firebase login
   ```

2. **Initialize Firebase in your project**:
   ```bash
   npx firebase init firestore
   ```
   - Select your project when prompted
   - Use existing `firestore.rules` file

3. **Deploy the security rules**:
   ```bash
   npx firebase deploy --only firestore:rules
   ```

## Step 8: Deploy Firestore Indexes

```bash
npx firebase deploy --only firestore:indexes
```

## Step 9: Test the Setup

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser** to `http://localhost:3000`

3. **Check the browser console** for any Firebase connection errors

## Database Collections Structure

The application uses the following Firestore collections:

### Core Collections

- **`users`** - User accounts and authentication
  - `email`, `role`, `staffId`, `createdAt`, `lastLoginAt`

- **`staff`** - Staff member information
  - `name`, `contactInfo`, `notes`, `availability`, `linkedUserId`, `createdAt`, `updatedAt`

- **`products`** - Product catalog
  - `name`, `description`, `category`, `components[]`, `stockLevel`, `minStockLevel`, `createdAt`, `updatedAt`

- **`jobs`** - Job/event bookings
  - `clientDetails`, `dates`, `location`, `products[]`, `status`, `assignedStaff[]`, `assignedVehicles[]`, `notes`, `createdAt`, `updatedAt`

- **`vehicles`** - Vehicle fleet management
  - `name`, `type`, `registration`, `maintenanceSchedule`, `availability`, `assignedJobs[]`, `createdAt`

- **`components`** - Individual components/parts
  - `name`, `description`, `category`, `stockLevel`, `minStockLevel`, `usedInProducts[]`, `createdAt`

## Security Rules

The Firestore security rules are configured in `firestore.rules` and allow:

- **Authenticated users** to read/write their own user data
- **Authenticated users** to read/write staff, products, components, vehicles, and jobs
- **Admin users** to modify application settings
- **Users** to manage their own notifications

## Development vs Production

### Development
- Use Firebase emulators for local development
- Start emulators: `npx firebase emulators:start`
- Connect to emulators in development mode

### Production
- Use live Firebase project
- Ensure proper security rules are deployed
- Monitor usage and costs in Firebase console

## Troubleshooting

### Common Issues

1. **"Firebase App named '[DEFAULT]' already exists"**
   - This is normal if Firebase is already initialized
   - The code handles this automatically

2. **"Missing or insufficient permissions"**
   - Check that Firestore security rules are deployed
   - Verify user authentication is working

3. **"Network request failed"**
   - Check your internet connection
   - Verify Firebase project configuration
   - Ensure environment variables are set correctly

### Getting Help

- Check Firebase console for error logs
- Review Firestore security rules
- Verify environment variables are correct
- Check browser console for JavaScript errors

## Next Steps

After setting up the database:

1. **Create initial admin user** through the application
2. **Add sample data** for testing
3. **Configure real-time listeners** for live updates
4. **Set up WebSocket server** for instant notifications
5. **Deploy to production** using Vercel

## Cost Considerations

Firebase Firestore pricing (as of 2024):
- **Free tier**: 1GB storage, 50K reads/day, 20K writes/day
- **Paid tier**: $0.18/GB storage, $0.06/100K reads, $0.18/100K writes

For a small business like Instant Marquees Melbourne, the free tier should be sufficient for most use cases. 