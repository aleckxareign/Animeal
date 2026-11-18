-- ==============================================================================
-- AniMeal Production Database Schema for Supabase (PostgreSQL)
-- Optimized for high performance, data integrity, and strict Row Level Security
-- Copy and paste this directly into the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Enables fuzzy search on food brands and vet clinics

-- ──────────────────────────────────────────────────────────────────────────────
-- AUTOMATIC TIMESTAMP TRIGGER FUNCTION
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. User Profiles Table (extends Supabase auth.users)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automatically create or update profile when a user signs up
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
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Pets Table
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat')),
  breed TEXT NOT NULL DEFAULT 'Aspin',
  weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 0),
  age_years NUMERIC(4, 1) NOT NULL CHECK (age_years >= 0),
  neutered BOOLEAN NOT NULL DEFAULT false,
  life_stage TEXT NOT NULL CHECK (life_stage IN ('puppy', 'kitten', 'adult', 'senior')),
  avatar_emoji TEXT DEFAULT '🐾',
  daily_rer_target NUMERIC(7, 2) NOT NULL CHECK (daily_rer_target >= 0),
  water_goal_ml NUMERIC(7, 2) NOT NULL DEFAULT 500 CHECK (water_goal_ml >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_pets_updated_at ON public.pets;
CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. Feeding Logs Table
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feeding_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id TEXT,
  food_name TEXT NOT NULL,
  brand TEXT,
  portion_g NUMERIC(6, 2) NOT NULL CHECK (portion_g >= 0),
  portion_unit TEXT DEFAULT 'g',
  calories_consumed NUMERIC(6, 2) NOT NULL CHECK (calories_consumed >= 0),
  protein_g NUMERIC(6, 2) DEFAULT 0 CHECK (protein_g >= 0),
  fat_g NUMERIC(6, 2) DEFAULT 0 CHECK (fat_g >= 0),
  fiber_g NUMERIC(6, 2) DEFAULT 0 CHECK (fiber_g >= 0),
  fed_by_name TEXT DEFAULT 'Owner',
  fed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. Food Catalog & Custom Foods Table
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for verified global catalog foods
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  species TEXT[] NOT NULL DEFAULT '{"dog"}',
  category TEXT NOT NULL CHECK (category IN ('dry', 'wet', 'treat', 'raw', 'homemade')),
  life_stage_suitability TEXT[] DEFAULT '{"adult"}',
  calories_per_100g NUMERIC(6, 2) NOT NULL CHECK (calories_per_100g >= 0),
  protein_pct NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (protein_pct >= 0),
  fat_pct NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (fat_pct >= 0),
  fiber_pct NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (fiber_pct >= 0),
  moisture_pct NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (moisture_pct >= 0),
  serving_size_g NUMERIC(6, 2) DEFAULT 100 CHECK (serving_size_g >= 0),
  serving_unit TEXT DEFAULT 'g',
  price_php NUMERIC(7, 2) CHECK (price_php IS NULL OR price_php >= 0),
  package_size_g NUMERIC(7, 2) CHECK (package_size_g IS NULL OR package_size_g >= 0),
  price_per_calorie NUMERIC(7, 4) CHECK (price_per_calorie IS NULL OR price_per_calorie >= 0),
  verified BOOLEAN DEFAULT false,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_foods_updated_at ON public.foods;
CREATE TRIGGER update_foods_updated_at
  BEFORE UPDATE ON public.foods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────────
-- 6. Pet Wellness & Care Tasks Table
-- ──────────────────────────────────────────────────────────────────────────────
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_care_tasks_updated_at ON public.care_tasks;
CREATE TRIGGER update_care_tasks_updated_at
  BEFORE UPDATE ON public.care_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────────
-- 7. Daily Hydration Logs Table
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hydration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml NUMERIC(6, 2) NOT NULL CHECK (amount_ml >= 0),
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 8. Weight Progression Logs Table
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 0),
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 9. Shared Household Members Table
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.household_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#44632f',
  is_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_household_updated_at ON public.household_members;
CREATE TRIGGER update_household_updated_at
  BEFORE UPDATE ON public.household_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────────
-- 10. Ask Mealie AI Chat Conversations Table
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Chat with Mealie',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_chat UNIQUE (user_id)
);

DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────────
-- 11. Veterinary Clinics Directory Table
-- ──────────────────────────────────────────────────────────────────────────────
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
  rating NUMERIC(3, 1) DEFAULT 4.8 CHECK (rating >= 1.0 AND rating <= 5.0),
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_vets_updated_at ON public.vets;
CREATE TRIGGER update_vets_updated_at
  BEFORE UPDATE ON public.vets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- HIGH-PERFORMANCE DATABASE INDEXES
-- Eliminates full-table sequential scans for fast queries and low latency
-- ==============================================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Pets
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON public.pets(user_id);
CREATE INDEX IF NOT EXISTS idx_pets_user_created ON public.pets(user_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_pets_species ON public.pets(species);

-- Feeding Logs (Optimized for dashboard & daily date-range filters)
CREATE INDEX IF NOT EXISTS idx_feeding_logs_user_fed ON public.feeding_logs(user_id, fed_at DESC);
CREATE INDEX IF NOT EXISTS idx_feeding_logs_pet_fed ON public.feeding_logs(pet_id, fed_at DESC);
CREATE INDEX IF NOT EXISTS idx_feeding_logs_date ON public.feeding_logs(fed_at DESC);

-- Food Catalog (Optimized for instant filtering and searches)
CREATE INDEX IF NOT EXISTS idx_foods_verified ON public.foods(verified, category);
CREATE INDEX IF NOT EXISTS idx_foods_user_id ON public.foods(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_foods_brand_name ON public.foods(brand, name);
CREATE INDEX IF NOT EXISTS idx_foods_species_gin ON public.foods USING GIN(species);
CREATE INDEX IF NOT EXISTS idx_foods_lifestage_gin ON public.foods USING GIN(life_stage_suitability);

-- Care Tasks & Reminders
CREATE INDEX IF NOT EXISTS idx_care_tasks_user_due ON public.care_tasks(user_id, due_date ASC);
CREATE INDEX IF NOT EXISTS idx_care_tasks_pet_completed ON public.care_tasks(pet_id, completed);

-- Hydration & Weight Logs
CREATE INDEX IF NOT EXISTS idx_hydration_logs_pet_time ON public.hydration_logs(pet_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_time ON public.hydration_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_weight_logs_pet_time ON public.weight_logs(pet_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_time ON public.weight_logs(user_id, logged_at DESC);

-- Shared Household & Chat
CREATE INDEX IF NOT EXISTS idx_household_user_id ON public.household_members(user_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON public.chat_conversations(user_id, updated_at DESC);

-- Vets Directory
CREATE INDEX IF NOT EXISTS idx_vets_city_rating ON public.vets(city, rating DESC);
CREATE INDEX IF NOT EXISTS idx_vets_emergency ON public.vets(emergency) WHERE emergency = true;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Complete CRUD isolation ensuring users can strictly only access their own data
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

-- 1. Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2. Pets
DROP POLICY IF EXISTS "Users can view own pets" ON public.pets;
CREATE POLICY "Users can view own pets" ON public.pets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own pets" ON public.pets;
CREATE POLICY "Users can insert own pets" ON public.pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own pets" ON public.pets;
CREATE POLICY "Users can update own pets" ON public.pets
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own pets" ON public.pets;
CREATE POLICY "Users can delete own pets" ON public.pets
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Feeding Logs (Full CRUD)
DROP POLICY IF EXISTS "Users can view own feedings" ON public.feeding_logs;
CREATE POLICY "Users can view own feedings" ON public.feeding_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own feedings" ON public.feeding_logs;
CREATE POLICY "Users can insert own feedings" ON public.feeding_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own feedings" ON public.feeding_logs;
CREATE POLICY "Users can update own feedings" ON public.feeding_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own feedings" ON public.feeding_logs;
CREATE POLICY "Users can delete own feedings" ON public.feeding_logs
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Foods (Verified public read + custom foods CRUD)
DROP POLICY IF EXISTS "Anyone can view verified foods" ON public.foods;
CREATE POLICY "Anyone can view verified foods" ON public.foods
  FOR SELECT USING (verified = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create custom foods" ON public.foods;
CREATE POLICY "Users can create custom foods" ON public.foods
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_custom = true);

DROP POLICY IF EXISTS "Users can update own custom foods" ON public.foods;
CREATE POLICY "Users can update own custom foods" ON public.foods
  FOR UPDATE USING (auth.uid() = user_id AND is_custom = true)
  WITH CHECK (auth.uid() = user_id AND is_custom = true);

DROP POLICY IF EXISTS "Users can delete own custom foods" ON public.foods;
CREATE POLICY "Users can delete own custom foods" ON public.foods
  FOR DELETE USING (auth.uid() = user_id AND is_custom = true);

-- 5. Care Tasks (Full CRUD)
DROP POLICY IF EXISTS "Users can manage care tasks" ON public.care_tasks;
CREATE POLICY "Users can manage care tasks" ON public.care_tasks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Hydration Logs (Full CRUD)
DROP POLICY IF EXISTS "Users can manage hydration" ON public.hydration_logs;
CREATE POLICY "Users can manage hydration" ON public.hydration_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Weight Logs (Full CRUD)
DROP POLICY IF EXISTS "Users can manage weight logs" ON public.weight_logs;
CREATE POLICY "Users can manage weight logs" ON public.weight_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. Household Members (Full CRUD)
DROP POLICY IF EXISTS "Users can manage household members" ON public.household_members;
CREATE POLICY "Users can manage household members" ON public.household_members
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. Chat Conversations (Full CRUD)
DROP POLICY IF EXISTS "Users can manage chat conversations" ON public.chat_conversations;
CREATE POLICY "Users can manage chat conversations" ON public.chat_conversations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 10. Vets Directory (Public read-only)
DROP POLICY IF EXISTS "Anyone can view vets directory" ON public.vets;
CREATE POLICY "Anyone can view vets directory" ON public.vets
  FOR SELECT USING (true);

-- ──────────────────────────────────────────────────────────────────────────────
-- EFFICIENT AGGREGATION STORED PROCEDURES
-- Compute daily nutrition & hydration directly inside PostgreSQL
-- ──────────────────────────────────────────────────────────────────────────────

-- Calculate a pet's daily calorie & macronutrient totals in 1 database call
CREATE OR REPLACE FUNCTION public.get_daily_pet_nutrition(
  p_pet_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_calories NUMERIC,
  total_protein_g NUMERIC,
  total_fat_g NUMERIC,
  total_fiber_g NUMERIC,
  total_meals BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(calories_consumed), 0)::NUMERIC AS total_calories,
    COALESCE(SUM(protein_g), 0)::NUMERIC AS total_protein_g,
    COALESCE(SUM(fat_g), 0)::NUMERIC AS total_fat_g,
    COALESCE(SUM(fiber_g), 0)::NUMERIC AS total_fiber_g,
    COUNT(*)::BIGINT AS total_meals
  FROM public.feeding_logs
  WHERE pet_id = p_pet_id
    AND DATE(fed_at AT TIME ZONE 'Asia/Manila') = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate a pet's daily hydration total in 1 database call
CREATE OR REPLACE FUNCTION public.get_daily_pet_hydration(
  p_pet_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS NUMERIC AS $$
DECLARE
  v_total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount_ml), 0)
  INTO v_total
  FROM public.hydration_logs
  WHERE pet_id = p_pet_id
    AND DATE(logged_at AT TIME ZONE 'Asia/Manila') = p_date;
  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
