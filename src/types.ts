// Feedback source types
export type FeedbackSource = 'discord' | 'github' | 'twitter' | 'support';

// Sentiment classification
export type Sentiment = 'positive' | 'neutral' | 'negative';

// Database row type
export interface FeedbackRow {
  id: number;
  source: FeedbackSource;
  text: string;
  user: string | null;
  timestamp: string;
  sentiment: Sentiment | null;
  priority_score: number | null;
  themes: string | null;
}

// API request types
export interface CreateFeedbackRequest {
  source: FeedbackSource;
  text: string;
  user?: string;
}

export interface FeedbackListQuery {
  source?: FeedbackSource;
  sentiment?: Sentiment;
  limit?: number;
  offset?: number;
}

// API response types
export interface AnalyzeResponse {
  processed: number;
  remaining: number;
  items: Array<{
    id: number;
    sentiment: Sentiment;
    priority_score: number;
  }>;
}

// Workers AI text classification result
export interface TextClassificationResult {
  label: string;
  score: number;
}
