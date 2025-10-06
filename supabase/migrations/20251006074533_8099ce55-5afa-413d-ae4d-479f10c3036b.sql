-- Function to update user analytics when a memory is created or deleted
CREATE OR REPLACE FUNCTION update_user_analytics()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_date date;
  v_count integer;
BEGIN
  -- Get user_id and date from the memory
  IF TG_OP = 'DELETE' THEN
    v_user_id := OLD.user_id;
    v_date := DATE(OLD.timestamp);
  ELSE
    v_user_id := NEW.user_id;
    v_date := DATE(NEW.timestamp);
  END IF;

  -- Count memories for this user on this date
  SELECT COUNT(*) INTO v_count
  FROM memories
  WHERE user_id = v_user_id
    AND DATE(timestamp) = v_date;

  -- Insert or update the analytics record
  INSERT INTO user_analytics (user_id, date, memory_count)
  VALUES (v_user_id, v_date, v_count)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    memory_count = v_count,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT operations
DROP TRIGGER IF EXISTS trigger_update_analytics_on_insert ON memories;
CREATE TRIGGER trigger_update_analytics_on_insert
AFTER INSERT ON memories
FOR EACH ROW
EXECUTE FUNCTION update_user_analytics();

-- Create trigger for DELETE operations
DROP TRIGGER IF EXISTS trigger_update_analytics_on_delete ON memories;
CREATE TRIGGER trigger_update_analytics_on_delete
AFTER DELETE ON memories
FOR EACH ROW
EXECUTE FUNCTION update_user_analytics();

-- Add unique constraint to prevent duplicate entries
ALTER TABLE user_analytics 
DROP CONSTRAINT IF EXISTS user_analytics_user_date_unique;

ALTER TABLE user_analytics
ADD CONSTRAINT user_analytics_user_date_unique UNIQUE (user_id, date);

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_analytics' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE user_analytics ADD COLUMN updated_at timestamp with time zone DEFAULT now();
  END IF;
END $$;

-- Backfill analytics data for existing memories
INSERT INTO user_analytics (user_id, date, memory_count)
SELECT 
  user_id,
  DATE(timestamp) as date,
  COUNT(*) as memory_count
FROM memories
GROUP BY user_id, DATE(timestamp)
ON CONFLICT (user_id, date) 
DO UPDATE SET
  memory_count = EXCLUDED.memory_count,
  updated_at = now();