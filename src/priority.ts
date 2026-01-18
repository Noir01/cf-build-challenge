import { Sentiment } from './types';

// Keywords that indicate high urgency - bugs, errors, system failures
const CRITICAL_KEYWORDS = [
  'broken', 'crash', 'crashing', "can't", 'cannot', 'bug', 'error',
  'down', 'fail', 'failing', 'stuck', 'not working', 'blocked', 'urgent',
  'critical', '500', '503', 'locked out'
];

// Keywords that indicate feature requests or moderate priority
const REQUEST_KEYWORDS = [
  'please', 'need', 'want', 'missing', 'should', 'would be nice',
  'wish', 'add', 'support', 'help'
];

// Calculate priority score (0-10)
// Higher score = more urgent
export function calculatePriorityScore(
  sentiment: Sentiment,
  text: string,
  timestamp: string
): number {
  let score = 0;

  // Base sentiment score
  switch (sentiment) {
    case 'negative':
      score += 5;
      break;
    case 'neutral':
      score += 2;
      break;
    case 'positive':
      score += 0;
      break;
  }

  const lowerText = text.toLowerCase();

  // Keyword bonuses - check for critical keywords first
  let hasCritical = false;
  for (const keyword of CRITICAL_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      score += 2;
      hasCritical = true;
      break; // Only add once even if multiple matches
    }
  }

  // Only check request keywords if no critical keywords found
  if (!hasCritical) {
    for (const keyword of REQUEST_KEYWORDS) {
      if (lowerText.includes(keyword)) {
        score += 1;
        break; // Only add once
      }
    }
  }

  // Recency bonus (within last 24 hours)
  const feedbackTime = new Date(timestamp).getTime();
  const now = Date.now();
  const hoursAgo = (now - feedbackTime) / (1000 * 60 * 60);

  if (hoursAgo <= 24) {
    score += 1;
  }

  // Cap at 10
  return Math.min(score, 10);
}

// Check if score qualifies as high priority
export function isHighPriority(score: number): boolean {
  return score >= 6;
}
