-- Migration 003: Add Real User AI Feedback Loop & Suggestion Telemetry

CREATE TABLE IF NOT EXISTS ai_feedback (
    id VARCHAR(64) PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    suggestion_id VARCHAR(64),
    suggestion_type VARCHAR(50) NOT NULL, -- plan_generation, budget_rescue, assistant_chat, vendor_recommendation
    rating VARCHAR(20) NOT NULL, -- positive, negative, neutral
    user_action VARCHAR(30) NOT NULL, -- accepted, rejected, modified, viewed_only
    feedback_comment TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_event ON ai_feedback(event_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user ON ai_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_type ON ai_feedback(suggestion_type);
