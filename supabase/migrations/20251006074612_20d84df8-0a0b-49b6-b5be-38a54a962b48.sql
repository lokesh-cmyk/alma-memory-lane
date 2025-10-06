-- Fix search_path for the update_user_analytics function
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
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;