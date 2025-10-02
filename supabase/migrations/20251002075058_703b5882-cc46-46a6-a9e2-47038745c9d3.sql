-- Enable Row Level Security on reminders table
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing own reminders
CREATE POLICY "Users can view their own reminders"
ON public.reminders
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for creating own reminders
CREATE POLICY "Users can create their own reminders"
ON public.reminders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy for updating own reminders
CREATE POLICY "Users can update their own reminders"
ON public.reminders
FOR UPDATE
USING (auth.uid() = user_id);

-- Create policy for deleting own reminders
CREATE POLICY "Users can delete their own reminders"
ON public.reminders
FOR DELETE
USING (auth.uid() = user_id);