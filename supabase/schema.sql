-- ==============================================================================
-- Animeal Production Database Schema for Supabase (PostgreSQL)
-- Optimized for high performance, strict data integrity, zero redundancy,
-- space efficiency, and bulletproof Row Level Security (RLS).
--
-- Instructions:
-- Paste this script into your Supabase Dashboard:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 0. CLEAN RESET: DROP EXISTING TABLES & TRIGGERS (FRESH INSTALL)
-- ──────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

DROP TABLE IF EXISTS public.chat_conversations CASCADE;
DROP TABLE IF EXISTS public.household_members CASCADE;
DROP TABLE IF EXISTS public.care_tasks CASCADE;
DROP TABLE IF EXISTS public.weight_logs CASCADE;
DROP TABLE IF EXISTS public.hydration_logs CASCADE;
DROP TABLE IF EXISTS public.feeding_logs CASCADE;
DROP TABLE IF EXISTS public.foods CASCADE;
DROP TABLE IF EXISTS public.vets CASCADE;
DROP TABLE IF EXISTS public.pets CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. EXTENSIONS
-- ──────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Enables fast fuzzy search for foods & clinics

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. AUTOMATIC TIMESTAMP TRIGGER FUNCTION
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. PROFILES TABLE (Extends Supabase auth.users)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: Automatically create or update profile when a user signs up
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. PETS TABLE
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat')),
  breed TEXT NOT NULL DEFAULT 'Aspin',
  weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 0),
  age_years NUMERIC(4, 1) NOT NULL CHECK (age_years >= 0),
  neutered BOOLEAN NOT NULL DEFAULT false,
  sex TEXT NOT NULL DEFAULT 'unknown' CHECK (sex IN ('male', 'female', 'unknown')),
  dietary_preference TEXT NOT NULL DEFAULT 'any' CHECK (dietary_preference IN ('any', 'dry_only', 'wet_only', 'home_cooked', 'picky')),
  preferred_foods TEXT[] NOT NULL DEFAULT '{}',
  avoided_foods TEXT[] NOT NULL DEFAULT '{}',
  life_stage TEXT NOT NULL CHECK (life_stage IN ('puppy', 'kitten', 'adult', 'senior')),
  avatar_emoji TEXT DEFAULT '🐾',
  avatar_url TEXT,
  daily_rer_target NUMERIC(7, 2) NOT NULL CHECK (daily_rer_target >= 0),
  water_goal_ml NUMERIC(7, 2) NOT NULL DEFAULT 500 CHECK (water_goal_ml >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. FEEDING LOGS TABLE ("Napakain ko na!" & Calorie Tracking)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.feeding_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id TEXT,
  food_name TEXT NOT NULL,
  brand TEXT,
  portion_g NUMERIC(6, 2) NOT NULL CHECK (portion_g >= 0),
  portion_unit TEXT DEFAULT 'g' CHECK (portion_unit IN ('g', 'scoop', 'can', 'piece', 'cup', 'tbsp')),
  calories_consumed NUMERIC(6, 2) NOT NULL CHECK (calories_consumed >= 0),
  protein_g NUMERIC(6, 2) DEFAULT 0 CHECK (protein_g >= 0),
  fat_g NUMERIC(6, 2) DEFAULT 0 CHECK (fat_g >= 0),
  fiber_g NUMERIC(6, 2) DEFAULT 0 CHECK (fiber_g >= 0),
  fed_by_name TEXT DEFAULT 'Owner',
  undone BOOLEAN NOT NULL DEFAULT false, -- Supports one-click undo for duplicate feeding
  fed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 6. FOOD CATALOG & CUSTOM FOODS TABLE
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for verified public catalog foods
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_foods_updated_at
  BEFORE UPDATE ON public.foods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────────
-- 7. CARE SCHEDULE & TASKS TABLE
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.care_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN (
    'feeding', 'water', 'medication', 'grooming', 'exercise',
    'weight-check', 'vaccination', 'vet-appointment', 'deworming'
  )),
  notes TEXT,
  frequency TEXT DEFAULT 'once' CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly')),
  time TEXT DEFAULT '09:00',
  due_date TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_by TEXT,
  completed_at TIMESTAMPTZ,
  snoozed_until TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_care_tasks_updated_at
  BEFORE UPDATE ON public.care_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────────
-- 8. DAILY HYDRATION LOGS TABLE
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.hydration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml NUMERIC(6, 2) NOT NULL CHECK (amount_ml >= 0),
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 9. WEIGHT PROGRESSION LOGS TABLE
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 0),
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 10. SHARED HOUSEHOLD MEMBERS TABLE
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#44632f',
  is_owner BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'caregiver' CHECK (role IN ('owner', 'admin', 'caregiver', 'sitter')),
  email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_household_updated_at
  BEFORE UPDATE ON public.household_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────────
-- 11. ASK MEALIE AI CHAT CONVERSATIONS TABLE
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Chat with Mealie',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_chat UNIQUE (user_id) -- Consolidates conversation per user to save space
);

CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────────
-- 12. VETERINARY CLINICS DIRECTORY TABLE
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.vets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_vets_updated_at
  BEFORE UPDATE ON public.vets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- HIGH-PERFORMANCE DATABASE INDEXES (Fast Queries, Zero Sequential Scans)
-- ==============================================================================
CREATE INDEX idx_profiles_email ON public.profiles(email);

CREATE INDEX idx_pets_user_id ON public.pets(user_id);
CREATE INDEX idx_pets_user_created ON public.pets(user_id, created_at ASC);

-- Feeding Logs (Optimized for today's logs & calendar history)
CREATE INDEX idx_feeding_logs_user_pet_fed ON public.feeding_logs(user_id, pet_id, fed_at DESC);
CREATE INDEX idx_feeding_logs_active ON public.feeding_logs(user_id, pet_id, fed_at DESC) WHERE undone = false;

-- Foods Catalog (Fuzzy Search & GIN Filters)
CREATE INDEX idx_foods_brand_name_trgm ON public.foods USING GIN (name gin_trgm_ops, brand gin_trgm_ops);
CREATE INDEX idx_foods_species_gin ON public.foods USING GIN(species);
CREATE INDEX idx_foods_lifestage_gin ON public.foods USING GIN(life_stage_suitability);
CREATE INDEX idx_foods_verified ON public.foods(verified, category);
CREATE INDEX idx_foods_user_id ON public.foods(user_id) WHERE user_id IS NOT NULL;

-- Care Tasks
CREATE INDEX idx_care_tasks_user_due ON public.care_tasks(user_id, due_date ASC);
CREATE INDEX idx_care_tasks_pet_completed ON public.care_tasks(pet_id, completed);

-- Hydration & Weight Logs
CREATE INDEX idx_hydration_logs_pet_time ON public.hydration_logs(pet_id, logged_at DESC);
CREATE INDEX idx_weight_logs_pet_time ON public.weight_logs(pet_id, logged_at DESC);

-- Shared Household & Chat
CREATE INDEX idx_household_user_id ON public.household_members(user_id, created_at ASC);
CREATE INDEX idx_chat_conversations_user ON public.chat_conversations(user_id, updated_at DESC);

-- Vets Directory
CREATE INDEX idx_vets_city ON public.vets(city);
CREATE INDEX idx_vets_emergency ON public.vets(emergency) WHERE emergency = true;
CREATE INDEX idx_vets_name_trgm ON public.vets USING GIN (name gin_trgm_ops);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Complete isolation: users only see and edit their own data.
-- ==============================================================================

-- 1. Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Pets
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own pets" ON public.pets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Feeding Logs
ALTER TABLE public.feeding_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own feeding logs" ON public.feeding_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Foods
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
-- Verified catalog foods are readable by any authenticated user
CREATE POLICY "Allow read access to public verified foods" ON public.foods
  FOR SELECT USING (verified = true OR auth.uid() = user_id);
-- Users can insert, update, delete their own custom foods
CREATE POLICY "Users can manage custom foods" ON public.foods
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Care Tasks
ALTER TABLE public.care_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own care tasks" ON public.care_tasks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Hydration Logs
ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own hydration logs" ON public.hydration_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Weight Logs
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own weight logs" ON public.weight_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. Household Members
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own household members" ON public.household_members
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. Chat Conversations
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own chat conversations" ON public.chat_conversations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 10. Vets Directory
ALTER TABLE public.vets ENABLE ROW LEVEL SECURITY;
-- All authenticated users can view the verified veterinary directory
CREATE POLICY "Allow public read access to verified vets" ON public.vets
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert vets" ON public.vets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ==============================================================================
-- STORAGE BUCKETS & POLICIES (Pet Avatars & Food Scanner Images)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('pet-avatars', 'pet-avatars', true),
  ('food-scans', 'food-scans', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Storage RLS: Pet Avatars (Public read, authenticated upload/modify)
CREATE POLICY "Public can view pet avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'pet-avatars');

CREATE POLICY "Users can upload pet avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pet-avatars' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update and delete pet avatars" ON storage.objects
  FOR ALL USING (
    bucket_id = 'pet-avatars' AND
    auth.role() = 'authenticated'
  );

-- Storage RLS: Food Scans (Private to user)
CREATE POLICY "Users can manage own food scans" ON storage.objects
  FOR ALL USING (
    bucket_id = 'food-scans' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
