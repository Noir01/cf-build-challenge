# FeedbackFlow - PM Intern Assignment Submission

## Project Links

- **Live Demo**: https://feedbackflow.ansriv711.workers.dev
- **GitHub Repository**: https://github.com/Noir01/cf-build-challenge

---

## Architecture Overview

![screenshot of bindings subpage of the project on Cloudflare dashboard](https://media.discordapp.net/attachments/811766823606943787/1462307787702009946/preview.png?ex=696db7c0&is=696c6640&hm=d602e3b3277f639c630e6b29c6640b9acdb92e7d1dff660ea9d662e9370c6666&=&format=webp&quality=lossless)

### Cloudflare Products Used

| Product | Purpose | Rationale |
|---------|---------|-----------|
| **Workers** | API endpoints + static asset hosting | Serverless compute for request handling, no infrastructure management |
| **D1** | SQLite database for feedback storage | Structured data with SQL querying: filter by source, sort by priority, aggregate counts |
| **Workers AI** | Sentiment analysis (`@cf/huggingface/distilbert-sst-2-int8`) | On-platform inference = low latency, no external API keys, purpose-built text classification |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Dashboard UI |
| GET | `/api/feedback` | List feedback with filters (?source=, ?sentiment=) |
| GET | `/api/feedback/priority` | Top 5 high-priority items |
| POST | `/api/feedback` | Ingest new feedback |
| POST | `/api/analyze` | Trigger AI sentiment analysis |

---

## Cloudflare Product Insights

### Insight 1: Workers.dev Subdomain Registration Blocker

**Problem**: When deploying for the first time with `npm run deploy`, the worker and assets upload successfully, but deployment is blocked with: "You need to register a workers.dev subdomain before publishing." The upload succeeds but the worker isn't accessible. This is wasted effort and confusing for new users.

**Suggestion**: Fail fast before uploading if no subdomain exists. The current behavior (upload then fail) is misleading.

---

### Insight 2: Local Development with AI Bindings 

**Problem**: Running `npm run dev` fails when using Workers AI because it requires "remote mode" which needs a registered workers.dev subdomain. D1 works locally, but AI cannot. This creates a split development experience. You can test database operations locally but must deploy to test AI features.

**Suggestion**: Provide a stub mode for AI bindings during local development, or allow local inference with rate limits. The mixed local/remote experience is confusing for first-time users who expect `npm run dev` to "just work."

---

### Insight 3: TypeScript Type Generation - Excellent DX

**Problem**: None - this is a highlight. Running `wrangler types` automatically generates TypeScript interfaces for all bindings (D1Database, Ai, Fetcher). The types are accurate, the command is fast, and it provides a helpful reminder to rerun after config changes.

**Opportunity**: Extend this to D1 schemas. Auto-generating types from table definitions would complete the type-safety story.

---

### Insight 4: D1 Database Creation - Smooth Experience

**Problem**: Minor friction - after running `npx wrangler d1 create`, it asks "Would you like Wrangler to add it on your behalf?" but falls back to "no" in non-interactive contexts (like Claude Code). The config snippet is helpful, but manual copy-paste is required.

**Opportunity**: Auto-add the binding to wrangler.jsonc when the database is created. The helpful config snippet output is excellent though.

---

### Insight 5: Workers AI Inference - Surprisingly Fast

**Problem**: None - this exceeded expectations. The `@cf/huggingface/distilbert-sst-2-int8` model processed 25 feedback entries in ~5 seconds with accurate sentiment classification. The API is simple (`env.AI.run(modelName, { text })`), no cold start issues were noticed.

**Opportunity**: Add a --dry-run flag to test AI calls locally with mocked responses. This would let developers validate their integration logic without deploying.

---

## Vibe-Coding Context

**Platform**: Claude Code

**Approach**: Provided a comprehensive PRD with:
- Problem statement and user persona
- Feature prioritization (P0/P1/P2)
- Product rationale
- Data model and API specifications
- Priority scoring algorithm

**Prompts**
I prompted Claude Code in Plan mode with my PRD.md (a scoped PRD upfront results in fewer iterations than open-ended prompting) and emphasized the usage of the Cloudflare documentation MCP as well as asking me clarifying questions *before* beginning development.I then kept track of it's edits and thinking and authorized necessary commands.