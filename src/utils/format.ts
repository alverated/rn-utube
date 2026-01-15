// Utility functions for formatting numbers and text

export function formatNumber(num: string | number): string {
  // If it's already a string with commas or letters (like "1.2M"), return as is
  if (typeof num === 'string' && (num.includes(',') || /[a-zA-Z]/.test(num))) {
    return num;
  }

  // Convert to number if it's a string
  const number = typeof num === 'string' ? parseInt(num.replace(/,/g, '')) : num;

  // Check if it's a valid number
  if (isNaN(number)) {
    return String(num);
  }

  // Format with commas
  return number.toLocaleString('en-US');
}

export function formatDuration(duration: string | number | undefined): string | undefined {
  if (!duration) return undefined;

  // If it's a string and already formatted (contains colon), return as is
  if (typeof duration === 'string' && duration.includes(':')) {
    return duration;
  }

  // Convert to number if it's a string
  let totalSeconds: number;
  if (typeof duration === 'string') {
    // Try to parse as number (seconds)
    totalSeconds = parseInt(duration);
    if (isNaN(totalSeconds)) {
      // Try ISO 8601 format (PT1H2M30S)
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (match) {
        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = parseInt(match[3] || '0');
        totalSeconds = hours * 3600 + minutes * 60 + seconds;
      } else {
        return duration; // Return original if can't parse
      }
    }
  } else {
    totalSeconds = duration;
  }

  // Convert seconds to HH:MM:SS or MM:SS format
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format based on length
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
