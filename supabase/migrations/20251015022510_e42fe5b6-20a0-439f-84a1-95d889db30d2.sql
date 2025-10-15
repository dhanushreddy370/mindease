-- Add emergency contact fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship text;

-- Create scheduled_notifications table for Feature 4
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheduled_for timestamptz NOT NULL,
  message text NOT NULL,
  event_context text,
  sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on scheduled_notifications
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for scheduled_notifications
CREATE POLICY "Users can view own notifications"
ON scheduled_notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
ON scheduled_notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON scheduled_notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests from cron jobs
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create index for efficient notification queries
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_pending 
ON scheduled_notifications(scheduled_for, sent) 
WHERE sent = false;