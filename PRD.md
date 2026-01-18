# FeedbackFlow

## The Problem

Product teams drown in feedback from Discord, GitHub, Twitter, support tickets, and forums. The current reality:
- Feedback is scattered across 5+ platforms
- No unified view of sentiment or themes
- Critical issues get buried in noise
- PMs manually triage hundreds of messages daily
- Patterns ("10 users reported the same bug") go unnoticed

**The cost:** Slow response to critical issues, missed product insights, frustrated customers, burned-out PMs.

---

## The Solution

A lightweight tool that ingests feedback from multiple sources, uses AI to analyze sentiment and detect patterns, and surfaces high-priority items automatically.

**Core value prop:** *"Never miss a critical bug report buried in Discord again."*

---

## Features

### P0

| Feature | Description |
|---------|-------------|
| **Feedback ingestion** | Store feedback entries with source, text, user, and timestamp |
| **Sentiment analysis** | Classify each entry as positive / neutral / negative using Workers AI |
| **Priority scoring** | Auto-score based on sentiment + keyword detection ("broken", "crash", "urgent") |
| **Dashboard** | Web UI showing all feedback, filterable by source/sentiment, sorted by priority |
| **High-priority alerts** | Surface top 5 critical items prominently |

### P1

| Feature | Description |
|---------|-------------|
| **Theme clustering** | Group similar feedback using embeddings ("5 users reported login issues") |
| **Slack notification** | Webhook that posts daily summary or instant alerts for critical items |
| **Trend view** | Simple chart showing sentiment over time |

**Why these products:**

| Product | Rationale |
|---------|-----------|
| **Workers** | Required. Hosts both API endpoints and serves the dashboard. Serverless = no infra management. |
| **D1** | Structured data (feedback entries) with SQL querying. Need to filter by source, sort by priority, aggregate counts. |
| **Workers AI** | On-platform inference = low latency, no external API keys. Sentiment analysis is a classic LLM use case. |

---

## Data Model

```sql
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,          -- 'discord' | 'github' | 'twitter' | 'support'
  text TEXT NOT NULL,
  user TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  sentiment TEXT,                -- 'positive' | 'neutral' | 'negative'
  priority_score INTEGER,        -- 0-10, higher = more urgent
  themes TEXT                    -- JSON array of detected themes (P1)
);
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Serve dashboard HTML |
| `GET` | `/api/feedback` | List all feedback (with filters: `?source=discord&sentiment=negative`) |
| `GET` | `/api/feedback/priority` | Get top N high-priority items |
| `POST` | `/api/feedback` | Ingest new feedback (for demo/testing) |
| `POST` | `/api/analyze` | Trigger AI analysis on unprocessed entries |

---

## Priority Scoring Logic

```
score = base_sentiment + keyword_bonus + recency_bonus

where:
  base_sentiment:
    negative = 5
    neutral  = 2
    positive = 0

  keyword_bonus:
    +2 if contains: "broken", "crash", "can't", "bug", "error", "down"
    +1 if contains: "please", "need", "want", "missing"

  recency_bonus:
    +1 if posted in last 24 hours
```

Items with `score >= 6` are flagged as high-priority.

---

## Mock Data

~20-30 entries covering:
- Mix of sources (Discord, GitHub, Twitter, Support)
- Mix of sentiments (some angry, some praise, some neutral feature requests)
- Some duplicates/similar themes (3 users complaining about mobile login)
- Different timestamps (some today, some last week)

---

## Success Criteria

For this prototype, success = :
1. Dashboard loads and displays all feedback
2. Sentiment labels are present and reasonably accurate
3. High-priority items surface correctly (negative + urgent keywords at top)