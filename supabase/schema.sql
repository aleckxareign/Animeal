-- ==============================================================================
-- AniMeal Production Database Schema for Supabase (PostgreSQL)
-- Copy and paste this directly into the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automatically create a profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, ''), '@', 1), 'Pet Parent'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Pets Table
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat')),
  breed TEXT NOT NULL DEFAULT 'Aspin',
  weight_kg NUMERIC(5, 2) NOT NULL,
  age_years NUMERIC(4, 1) NOT NULL,
  neutered BOOLEAN NOT NULL DEFAULT false,
  life_stage TEXT NOT NULL CHECK (life_stage IN ('puppy', 'kitten', 'adult', 'senior')),
  avatar_emoji TEXT DEFAULT '🐾',
  daily_rer_target NUMERIC(7, 2) NOT NULL,
  water_goal_ml NUMERIC(7, 2) NOT NULL DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Feeding Logs Table
CREATE TABLE IF NOT EXISTS public.feeding_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id TEXT,
  food_name TEXT NOT NULL,
  brand TEXT,
  portion_g NUMERIC(6, 2) NOT NULL,
  portion_unit TEXT DEFAULT 'g',
  calories_consumed NUMERIC(6, 2) NOT NULL,
  protein_g NUMERIC(6, 2) DEFAULT 0,
  fat_g NUMERIC(6, 2) DEFAULT 0,
  fiber_g NUMERIC(6, 2) DEFAULT 0,
  fed_by_name TEXT DEFAULT 'Owner',
  fed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Food Catalog & Custom Foods Table
CREATE TABLE IF NOT EXISTS public.foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL if global verified food
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  species TEXT[] NOT NULL DEFAULT '{"dog"}',
  category TEXT NOT NULL CHECK (category IN ('dry', 'wet', 'treat', 'raw', 'homemade')),
  life_stage_suitability TEXT[] DEFAULT '{"adult"}',
  calories_per_100g NUMERIC(6, 2) NOT NULL,
  protein_pct NUMERIC(5, 2) NOT NULL,
  fat_pct NUMERIC(5, 2) NOT NULL,
  fiber_pct NUMERIC(5, 2) NOT NULL,
  moisture_pct NUMERIC(5, 2) NOT NULL,
  serving_size_g NUMERIC(6, 2) DEFAULT 100,
  serving_unit TEXT DEFAULT 'g',
  price_php NUMERIC(7, 2),
  package_size_g NUMERIC(7, 2),
  price_per_calorie NUMERIC(7, 4),
  verified BOOLEAN DEFAULT false,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Pet Wellness & Care Tasks Table
CREATE TABLE IF NOT EXISTS public.care_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  task_type TEXT NOT NULL,
  notes TEXT,
  frequency TEXT DEFAULT 'once',
  time TEXT DEFAULT '09:00',
  due_date TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_by TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  snoozed_until TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Daily Hydration Logs Table
CREATE TABLE IF NOT EXISTS public.hydration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml NUMERIC(6, 2) NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Weight Progression Logs Table
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5, 2) NOT NULL,
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Shared Household Members Table
CREATE TABLE IF NOT EXISTS public.household_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#44632f',
  is_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Ask Mealie AI Chat Conversations Table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Chat with Mealie',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Veterinary Clinics Directory Table
CREATE TABLE IF NOT EXISTS public.vets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  distance TEXT DEFAULT '2.0 km',
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  emergency BOOLEAN DEFAULT false,
  open_now BOOLEAN DEFAULT true,
  hours TEXT DEFAULT '8:00 AM – 8:00 PM',
  services TEXT[] DEFAULT '{"General Checkup", "Vaccination"}',
  rating NUMERIC(3, 1) DEFAULT 4.8,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can only view and update their own pets and logs
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vets ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view, insert, and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Pets: Users can select, insert, update, and delete their own pets
CREATE POLICY "Users can view own pets" ON public.pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pets" ON public.pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pets" ON public.pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pets" ON public.pets
  FOR DELETE USING (auth.uid() = user_id);

-- Feeding Logs: Users can view and add feeding logs for their pets
CREATE POLICY "Users can view own feedings" ON public.feeding_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedings" ON public.feeding_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Foods: Anyone can view verified foods; users can view/create custom foods
CREATE POLICY "Anyone can view verified foods" ON public.foods
  FOR SELECT USING (verified = true OR auth.uid() = user_id);

CREATE POLICY "Users can create custom foods" ON public.foods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Care Tasks, Hydration, Weight: Users can manage their own
CREATE POLICY "Users can manage care tasks" ON public.care_tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage hydration" ON public.hydration_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage weight logs" ON public.weight_logs
  FOR ALL USING (auth.uid() = user_id);

-- Household Members: Users can manage their own household roster
CREATE POLICY "Users can manage household members" ON public.household_members
  FOR ALL USING (auth.uid() = user_id);

-- Chat Conversations: Users can view and manage their Mealie chat sessions
CREATE POLICY "Users can manage chat conversations" ON public.chat_conversations
  FOR ALL USING (auth.uid() = user_id);

-- Vets Directory: Globally readable directory
CREATE POLICY "Anyone can view vets directory" ON public.vets
  FOR SELECT USING (true);

