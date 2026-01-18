import { CreateFeedbackRequest, FeedbackListQuery } from './types';
import {
  listFeedback,
  getHighPriorityFeedback,
  createFeedback,
  getUnanalyzedFeedback,
  updateFeedbackAnalysis,
  countUnanalyzedFeedback
} from './db';
import { analyzeSentiment } from './ai';
import { calculatePriorityScore } from './priority';

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // API Routes
      if (pathname.startsWith('/api/')) {

        // GET /api/feedback - List all feedback with optional filters
        if (pathname === '/api/feedback' && method === 'GET') {
          const query: FeedbackListQuery = {
            source: url.searchParams.get('source') as FeedbackListQuery['source'] || undefined,
            sentiment: url.searchParams.get('sentiment') as FeedbackListQuery['sentiment'] || undefined,
            limit: parseInt(url.searchParams.get('limit') || '50'),
            offset: parseInt(url.searchParams.get('offset') || '0'),
          };

          const feedback = await listFeedback(env.DB, query);
          return Response.json(feedback, { headers: corsHeaders });
        }

        // GET /api/feedback/priority - Get top high-priority items
        if (pathname === '/api/feedback/priority' && method === 'GET') {
          const limit = parseInt(url.searchParams.get('limit') || '5');
          const feedback = await getHighPriorityFeedback(env.DB, limit);
          return Response.json(feedback, { headers: corsHeaders });
        }

        // POST /api/feedback - Ingest new feedback
        if (pathname === '/api/feedback' && method === 'POST') {
          const body = await request.json() as CreateFeedbackRequest;

          // Validate required fields
          if (!body.source || !body.text) {
            return Response.json(
              { error: 'source and text are required' },
              { status: 400, headers: corsHeaders }
            );
          }

          // Validate source value
          const validSources = ['discord', 'github', 'twitter', 'support'];
          if (!validSources.includes(body.source)) {
            return Response.json(
              { error: 'source must be one of: discord, github, twitter, support' },
              { status: 400, headers: corsHeaders }
            );
          }

          const feedback = await createFeedback(env.DB, body);
          return Response.json(feedback, { status: 201, headers: corsHeaders });
        }

        // POST /api/analyze - Trigger AI analysis on unprocessed entries
        if (pathname === '/api/analyze' && method === 'POST') {
          const batchSize = parseInt(url.searchParams.get('batch') || '10');
          const unanalyzed = await getUnanalyzedFeedback(env.DB, batchSize);

          const results = [];

          for (const item of unanalyzed) {
            const sentiment = await analyzeSentiment(env.AI, item.text);
            const priorityScore = calculatePriorityScore(
              sentiment,
              item.text,
              item.timestamp
            );

            await updateFeedbackAnalysis(env.DB, item.id, sentiment, priorityScore);

            results.push({
              id: item.id,
              sentiment,
              priority_score: priorityScore
            });
          }

          const remaining = await countUnanalyzedFeedback(env.DB);

          return Response.json({
            processed: results.length,
            remaining,
            items: results
          }, { headers: corsHeaders });
        }

        // 404 for unknown API routes
        return Response.json(
          { error: 'Not found' },
          { status: 404, headers: corsHeaders }
        );
      }

      // Serve static assets for all other routes (dashboard)
      return env.ASSETS.fetch(request);

    } catch (error) {
      console.error('Error:', error);
      return Response.json(
        { error: 'Internal server error', details: String(error) },
        { status: 500, headers: corsHeaders }
      );
    }
  },
} satisfies ExportedHandler<Env>;
