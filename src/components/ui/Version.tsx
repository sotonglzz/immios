'use client';

import { getVersion, formatVersion } from '@/utils/version';

export default function Version() {
  const version = getVersion();
  const formattedVersion = formatVersion(version);

  return (
    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
      {formattedVersion}
    </span>
  );
} 