-- Run this SQL in your Supabase project's SQL Editor
CREATE TABLE public.predictions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  username text DEFAULT 'Anonymous',
  match_id int NOT NULL,
  home_score int NOT NULL,
  away_score int NOT NULL,
  points int DEFAULT 0,
  created_at timestamp DEFAULT now()
);

CREATE INDEX idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX idx_predictions_match_id ON public.predictions(match_id);

-- Allow anonymous access (Row Level Security off for simplicity)
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read predictions"
  ON public.predictions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert predictions"
  ON public.predictions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update predictions"
  ON public.predictions FOR UPDATE
  USING (true);
