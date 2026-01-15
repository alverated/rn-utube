// ID generation utilities

/**
 * Generate a simple unique ID
 * Using timestamp + random for simplicity (no uuid package needed for basic IDs)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
