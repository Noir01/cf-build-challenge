import { FeedbackRow, FeedbackSource, Sentiment, CreateFeedbackRequest, FeedbackListQuery } from './types';

// Get all feedback with optional filters
export async function listFeedback(
  db: D1Database,
  query: FeedbackListQuery
): Promise<FeedbackRow[]> {
  let sql = 'SELECT * FROM feedback WHERE 1=1';
  const params: (string | number)[] = [];

  if (query.source) {
    sql += ' AND source = ?';
    params.push(query.source);
  }
  if (query.sentiment) {
    sql += ' AND sentiment = ?';
    params.push(query.sentiment);
  }

  sql += ' ORDER BY priority_score DESC NULLS LAST, timestamp DESC';

  if (query.limit) {
    sql += ' LIMIT ?';
    params.push(query.limit);
  }
  if (query.offset) {
    sql += ' OFFSET ?';
    params.push(query.offset);
  }

  const { results } = await db.prepare(sql).bind(...params).all<FeedbackRow>();
  return results;
}

// Get top N high-priority items (score >= 6)
export async function getHighPriorityFeedback(
  db: D1Database,
  limit: number = 5
): Promise<FeedbackRow[]> {
  const { results } = await db
    .prepare(`
      SELECT * FROM feedback
      WHERE priority_score >= 6
      ORDER BY priority_score DESC, timestamp DESC
      LIMIT ?
    `)
    .bind(limit)
    .all<FeedbackRow>();
  return results;
}

// Insert new feedback entry
export async function createFeedback(
  db: D1Database,
  data: CreateFeedbackRequest
): Promise<FeedbackRow> {
  const { meta } = await db
    .prepare(`
      INSERT INTO feedback (source, text, user)
      VALUES (?, ?, ?)
    `)
    .bind(data.source, data.text, data.user || null)
    .run();

  const { results } = await db
    .prepare('SELECT * FROM feedback WHERE id = ?')
    .bind(meta.last_row_id)
    .all<FeedbackRow>();

  return results[0];
}

// Get unanalyzed feedback entries
export async function getUnanalyzedFeedback(
  db: D1Database,
  limit: number = 20
): Promise<FeedbackRow[]> {
  const { results } = await db
    .prepare(`
      SELECT * FROM feedback
      WHERE sentiment IS NULL
      ORDER BY timestamp DESC
      LIMIT ?
    `)
    .bind(limit)
    .all<FeedbackRow>();
  return results;
}

// Update feedback with analysis results
export async function updateFeedbackAnalysis(
  db: D1Database,
  id: number,
  sentiment: Sentiment,
  priorityScore: number
): Promise<void> {
  await db
    .prepare(`
      UPDATE feedback
      SET sentiment = ?, priority_score = ?
      WHERE id = ?
    `)
    .bind(sentiment, priorityScore, id)
    .run();
}

// Count remaining unanalyzed entries
export async function countUnanalyzedFeedback(db: D1Database): Promise<number> {
  const { results } = await db
    .prepare('SELECT COUNT(*) as count FROM feedback WHERE sentiment IS NULL')
    .all<{ count: number }>();
  return results[0].count;
}
