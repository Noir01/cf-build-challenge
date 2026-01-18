-- FeedbackFlow Database Schema
-- Drop existing table if exists for clean slate
DROP TABLE IF EXISTS feedback;

-- Create feedback table
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL CHECK(source IN ('discord', 'github', 'twitter', 'support')),
  text TEXT NOT NULL,
  user TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  sentiment TEXT CHECK(sentiment IN ('positive', 'neutral', 'negative')),
  priority_score INTEGER CHECK(priority_score >= 0 AND priority_score <= 10),
  themes TEXT  -- JSON array for P1 feature
);

-- Create indexes for common queries
CREATE INDEX idx_feedback_source ON feedback(source);
CREATE INDEX idx_feedback_sentiment ON feedback(sentiment);
CREATE INDEX idx_feedback_priority ON feedback(priority_score DESC);
CREATE INDEX idx_feedback_timestamp ON feedback(timestamp DESC);

-- Insert mock data (25 entries with mix of sources, sentiments, timestamps)

-- Discord feedback (5 entries)
INSERT INTO feedback (source, text, user, timestamp) VALUES
('discord', 'The new dashboard is broken! I can''t see any of my data.', 'frustrated_user#1234', datetime('now', '-2 hours')),
('discord', 'Love the new dark mode feature! Works great on my setup.', 'devfan#5678', datetime('now', '-5 hours')),
('discord', 'App keeps crashing when I try to export reports. Please fix!', 'reporter#9999', datetime('now', '-1 hours')),
('discord', 'Would be nice to have keyboard shortcuts for navigation.', 'poweruser#4321', datetime('now', '-12 hours')),
('discord', 'The API documentation is really helpful, thanks team!', 'builder#1111', datetime('now', '-3 days'));

-- GitHub issues (5 entries)
INSERT INTO feedback (source, text, user, timestamp) VALUES
('github', 'Bug: Login page throws 500 error after password reset. This is blocking our deployment.', 'octocat', datetime('now', '-30 minutes')),
('github', 'Feature request: Add webhook support for real-time notifications', 'integrator', datetime('now', '-2 days')),
('github', 'The build is failing on Node 20, need fix urgently. CI is completely broken.', 'cicd-bot', datetime('now', '-4 hours')),
('github', 'Documentation unclear for API rate limits. Need more examples.', 'newdev', datetime('now', '-1 day')),
('github', 'Great library! Saved us tons of development time. Keep up the good work.', 'happyteam', datetime('now', '-5 days'));

-- Twitter mentions (5 entries)
INSERT INTO feedback (source, text, user, timestamp) VALUES
('twitter', 'Just tried @FeedbackFlow and it''s amazing! Game changer for product teams.', '@productlead', datetime('now', '-6 hours')),
('twitter', '@FeedbackFlow is down again. This is the third time this week! Very frustrating.', '@angryuser', datetime('now', '-45 minutes')),
('twitter', 'Missing mobile app support. Please add iOS and Android apps!', '@mobiledev', datetime('now', '-8 hours')),
('twitter', 'The analytics feature is exactly what we needed. Thank you!', '@datadriven', datetime('now', '-2 days')),
('twitter', 'Can''t connect my Slack workspace. Error message is super confusing.', '@slackfan', datetime('now', '-3 hours'));

-- Support tickets (5 entries)
INSERT INTO feedback (source, text, user, timestamp) VALUES
('support', 'URGENT: Our entire team is locked out of the admin panel. This is a critical bug!', 'enterprise@bigcorp.com', datetime('now', '-15 minutes')),
('support', 'How do I upgrade my plan? The pricing page is confusing.', 'startup@founder.io', datetime('now', '-1 day')),
('support', 'Need help setting up SSO with Okta. Documentation seems outdated.', 'it@company.com', datetime('now', '-4 hours')),
('support', 'Billing issue: We were charged twice for the same month. Please refund.', 'accounts@client.org', datetime('now', '-2 hours')),
('support', 'Thank you for the quick response to our last ticket! Great support.', 'happy@customer.net', datetime('now', '-3 days'));

-- Additional mixed entries for variety (5 entries)
INSERT INTO feedback (source, text, user, timestamp) VALUES
('discord', 'Search is completely broken. Results are totally wrong.', 'searcher#2222', datetime('now', '-7 hours')),
('github', 'Please add TypeScript type definitions. Would really help with DX.', 'tsdev', datetime('now', '-4 days')),
('twitter', 'Interesting product, will try it out for our team next sprint.', '@curious', datetime('now', '-1 day')),
('support', 'Error 503 when accessing reports. This is blocking our work!', 'blocked@work.com', datetime('now', '-1 hour')),
('github', 'Memory leak in v2.3.0 causing server crashes. Need hotfix ASAP.', 'debugger', datetime('now', '-20 minutes'));
