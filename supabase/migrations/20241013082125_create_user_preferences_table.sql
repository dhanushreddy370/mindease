CREATE TABLE user_preferences (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  tone TEXT,
  specifics TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);