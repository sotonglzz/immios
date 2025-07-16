// Get the current version from package.json
export function getVersion(): string {
  try {
    // In a Next.js app, we can't directly read package.json during build time
    // So we'll use a different approach - we'll create a version file that gets updated
    return process.env.NEXT_PUBLIC_APP_VERSION || '0.1.1';
  } catch (error) {
    console.warn('Could not read version:', error);
    return '0.1.1';
  }
}

// Format version for display
export function formatVersion(version: string): string {
  return `v${version}`;
} 