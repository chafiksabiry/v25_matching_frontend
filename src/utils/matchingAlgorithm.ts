
/**
 * Calculate the matching score between a rep and a gig
 */
export function calculateMatchScore() {
  // ... function body ...
}

export function formatScore(score: number): string {
  // Format the score - adjust the implementation as needed for your application
  if (typeof score !== 'number' || isNaN(score)) {
    return 'N/A';
  }
  return `${(score * 100).toFixed(1)}%`;
}