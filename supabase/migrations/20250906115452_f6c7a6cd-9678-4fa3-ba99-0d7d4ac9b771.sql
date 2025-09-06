-- Add display_name to profiles for storing user's name
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS display_name text;

-- Optional: ensure updated_at auto-updates (uses existing function)
-- Create trigger only if not exists pattern via DO block
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at'
  ) THEN
    CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;