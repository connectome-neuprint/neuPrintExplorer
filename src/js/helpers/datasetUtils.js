export function parseDatasetTimestamp(lastmod) {
  if (!lastmod || lastmod === 'unknown') {
    return new Date(0); // Very old date for unknown timestamps
  }

  // Regex patterns for different timestamp formats
  const timestampPatterns = [
    // ISO 8601 with T separator: 2025-09-29T23:44:02-04:00
    /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?[+-]\d{2}:\d{2})/g,
    // Space separated: 2025-06-18 14:41:50.300008536-04:00
    /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?[+-]\d{2}:\d{2})/g,
    // Basic ISO format: 2024-09-11T00:04:56Z
    /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)/g,
    // Date only: 2024-09-11
    /(\d{4}-\d{2}-\d{2})/g
  ];

  const extractedDates = [];

  // Extract all possible timestamps using regex patterns
  for (const pattern of timestampPatterns) {
    let match;
    while ((match = pattern.exec(lastmod)) !== null) {
      const dateStr = match[1];
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        extractedDates.push(parsedDate);
      }
    }
  }

  // Return the most recent date if any were found
  if (extractedDates.length > 0) {
    return new Date(Math.max(...extractedDates.map(date => date.getTime())));
  }

  // If no valid timestamps found, return very old date
  return new Date(0);
}