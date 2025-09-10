/**
 * Utility functions for handling tags in different formats
 */

/**
 * Safely processes tags from various formats (string, array, null, etc.)
 * @param {any} tags - The tags data from the API (could be string, array, null, etc.)
 * @returns {Array} - Always returns an array of tags
 */
export const processTags = (tags) => {
  // Handle null/undefined
  if (!tags) {
    return [];
  }

  // If it's already an array, return it
  if (Array.isArray(tags)) {
    return tags.filter(tag => tag && typeof tag === 'string');
  }

  // If it's a string, try to parse as JSON first
  if (typeof tags === 'string') {
    // First try to parse as JSON (in case it's a stringified array)
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed.filter(tag => tag && typeof tag === 'string');
      }
    } catch {
      // If JSON parsing fails, treat as comma-separated string
      return tags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }
  }

  // For any other type, return empty array
  return [];
};

/**
 * Formats tags for display (limits to specific number and adds prefix)
 * @param {any} tags - The tags data
 * @param {number} limit - Maximum number of tags to display (default: 3)
 * @param {string} prefix - Prefix to add to each tag (default: '')
 * @returns {Array} - Processed and limited tags array
 */
export const formatTagsForDisplay = (tags, limit = 3, prefix = '') => {
  const processedTags = processTags(tags);
  return processedTags
    .slice(0, limit)
    .map(tag => prefix + tag);
};
