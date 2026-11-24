-- Apply in the Supabase SQL editor before deploying the updated pet forms.
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS sex TEXT NOT NULL DEFAULT 'unknown' CHECK (sex IN ('male', 'female', 'unknown')),
  ADD COLUMN IF NOT EXISTS dietary_preference TEXT NOT NULL DEFAULT 'any' CHECK (dietary_preference IN ('any', 'dry_only', 'wet_only', 'home_cooked', 'picky')),
  ADD COLUMN IF NOT EXISTS preferred_foods TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS avoided_foods TEXT[] NOT NULL DEFAULT '{}';
