-- Planora AI PostgreSQL / Supabase Database Schema
-- Compatible with Supabase SQL Editor and standard PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_date DATE NOT NULL,
    start_time VARCHAR(20),
    end_time VARCHAR(20),
    location VARCHAR(255) NOT NULL,
    indoor_outdoor VARCHAR(20) DEFAULT 'indoor',
    budget NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    guest_count INTEGER NOT NULL DEFAULT 50,
    theme_preference TEXT,
    cultural_preference TEXT,
    dietary_preferences TEXT,
    priority_areas TEXT[] DEFAULT '{}',
    additional_requirements TEXT,
    ai_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Budget Items Table
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    estimated_cost NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    actual_cost NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'estimated',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    due_date DATE,
    days_before_event INTEGER,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    quoted_amount NUMERIC(14, 2) DEFAULT 0.00,
    estimated_budget NUMERIC(14, 2) DEFAULT 0.00,
    booking_status VARCHAR(30) NOT NULL DEFAULT 'researching',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid',
    notes TEXT,
    is_ai_estimate BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Ideas & Recommendations Table
CREATE TABLE IF NOT EXISTS event_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, -- theme, decoration, menu, activity, recommendation
    title VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_cost NUMERIC(14, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Plan Revisions (Budget Rescue & Modifications)
CREATE TABLE IF NOT EXISTS plan_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    revision_note TEXT,
    previous_budget NUMERIC(14, 2) NOT NULL,
    new_budget NUMERIC(14, 2) NOT NULL,
    changes_applied JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_event_id ON budget_items(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_vendors_event_id ON vendors(event_id);
CREATE INDEX IF NOT EXISTS idx_event_ideas_event_id ON event_ideas(event_id);
CREATE INDEX IF NOT EXISTS idx_plan_revisions_event_id ON plan_revisions(event_id);

-- Supabase Row Level Security (RLS) setup
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_revisions ENABLE ROW LEVEL SECURITY;

-- Sample RLS policies (for Supabase auth integration):
-- CREATE POLICY "Users can only view their own events" ON events FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can only update their own events" ON events FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can only delete their own events" ON events FOR DELETE USING (auth.uid() = user_id);
