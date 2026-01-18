import { Sentiment, TextClassificationResult } from './types';

// Analyze text sentiment using Workers AI
// Uses @cf/huggingface/distilbert-sst-2-int8 model which returns POSITIVE/NEGATIVE
// We use confidence threshold to detect neutral sentiment
export async function analyzeSentiment(
  ai: Ai,
  text: string
): Promise<Sentiment> {
  const response = await ai.run(
    '@cf/huggingface/distilbert-sst-2-int8',
    { text }
  ) as TextClassificationResult[];

  // Find highest scoring label
  const sorted = response.sort((a, b) => b.score - a.score);
  const topResult = sorted[0];

  // If confidence is low (< 0.6), classify as neutral
  // This handles cases where the model is uncertain
  if (topResult.score < 0.6) {
    return 'neutral';
  }

  // Map POSITIVE/NEGATIVE to our sentiment types
  if (topResult.label === 'POSITIVE') {
    return 'positive';
  } else if (topResult.label === 'NEGATIVE') {
    return 'negative';
  }

  // Fallback to neutral for unexpected labels
  return 'neutral';
}
