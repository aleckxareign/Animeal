-- ==============================================================================
-- AniMeal Supabase Fix & Update Script
-- Copy and paste this directly into:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Ensure Profiles Table has proper RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON public.profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. Bulletproof handle_new_user Trigger (Never fails signup)
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

-- 3. Create Shared Household Members Table
CREATE TABLE IF NOT EXISTS public.household_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#44632f',
  is_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'household_members' AND policyname = 'Users can manage household members'
  ) THEN
    CREATE POLICY "Users can manage household members" ON public.household_members
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. Create Ask Mealie AI Chat Conversations Table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Chat with Mealie',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = 'Users can manage chat conversations'
  ) THEN
    CREATE POLICY "Users can manage chat conversations" ON public.chat_conversations
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 5. Create Veterinary Clinics Directory Table
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

-- Ensure latitude, longitude, and verified columns exist
ALTER TABLE public.vets ADD COLUMN IF NOT EXISTS latitude NUMERIC(9, 6);
ALTER TABLE public.vets ADD COLUMN IF NOT EXISTS longitude NUMERIC(9, 6);
ALTER TABLE public.vets ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT true;

ALTER TABLE public.vets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'vets' AND policyname = 'Anyone can view vets directory'
  ) THEN
    CREATE POLICY "Anyone can view vets directory" ON public.vets
      FOR SELECT USING (true);
  END IF;
END $$;

-- 6. Seed Veterinary Clinics & Animal Centers Directory
INSERT INTO public.vets (
  name, address, city, phone, distance, latitude, longitude, emergency, open_now, hours, services, rating, verified
) VALUES
('VetLink Animal Clinic', '123 Katipunan Ave, Loyola Heights', 'Quezon City', '(02) 8426-1234', '1.2 km', 14.6432, 121.0741, true, true, '8:00 AM – 10:00 PM', ARRAY['Surgery', 'Vaccination', 'Dental', 'Emergency', 'Ultrasound'], 4.8, true),
('Paws & Claws Veterinary Center', '456 Tomas Morato Ave, South Triangle', 'Quezon City', '(02) 8332-5678', '2.5 km', 14.6360, 121.0362, false, true, '9:00 AM – 6:00 PM', ARRAY['Vaccination', 'Grooming', 'Dental', 'Deworming'], 4.5, true),
('Animal House Veterinary Clinic', '789 Shaw Blvd, Pleasant Hills', 'Mandaluyong', '(02) 8534-9012', '3.8 km', 14.5882, 121.0471, true, true, 'Open 24 hours', ARRAY['Emergency', 'Surgery', 'ICU', 'Laboratory', 'X-Ray'], 4.9, true),
('Metro Vet Specialists', '369 Quezon Ave, Brgy. Paltok', 'Quezon City', '(02) 8712-2345', '3.0 km', 14.6374, 121.0152, true, false, '8:00 AM – 8:00 PM', ARRAY['Surgery', 'Oncology', 'Cardiology', 'Emergency', 'Orthopedics'], 4.8, true),
('Happy Tails Pet Clinic', '321 Marcos Highway, Santolan', 'Pasig', '(02) 8645-3456', '4.1 km', 14.6219, 121.0924, false, false, '8:00 AM – 5:00 PM', ARRAY['Vaccination', 'Deworming', 'Spay/Neuter', 'General Checkup'], 4.3, true),
('Buddy Animal Clinic', '42 Gen. Luna St, Brgy. Kapitolyo', 'Pasig', '(02) 8637-6789', '4.7 km', 14.5731, 121.0585, false, true, '9:00 AM – 5:00 PM', ARRAY['Vaccination', 'Deworming', 'Grooming', 'Nutritional Counseling'], 4.4, true),
('Dr. Pet Veterinary Hospital', '654 Ortigas Ave Extension', 'Cainta', '(02) 8682-7890', '5.3 km', 14.5843, 121.1192, true, true, 'Open 24 hours', ARRAY['Emergency', 'Surgery', 'Boarding', 'Vaccination', 'Ultrasound'], 4.7, true),
('Furever Friends Vet Clinic', '987 Commonwealth Ave, Batasan Hills', 'Quezon City', '(02) 8926-0123', '5.8 km', 14.6861, 121.0964, false, true, '9:00 AM – 7:00 PM', ARRAY['Vaccination', 'Grooming', 'Dental', 'Laboratory', 'Deworming'], 4.4, true),
('Pet Care Wellness Center', '147 Makati Ave, Poblacion', 'Makati', '(02) 8856-4567', '6.2 km', 14.5641, 121.0304, true, true, '7:00 AM – 11:00 PM', ARRAY['Emergency', 'Vaccination', 'Dermatology', 'Surgery', 'Dental'], 4.6, true),
('The Cat & Dog Clinic BGC', 'High Street South, 26th St, BGC', 'Taguig', '(02) 8810-9988', '5.5 km', 14.5492, 121.0521, true, true, 'Open 24 hours', ARRAY['Emergency', 'Surgery', 'ICU', 'Vaccination', 'Dental', 'Diagnostics'], 4.9, true),
('Manila Animal Medical Center', '2150 Taft Ave, Malate', 'Manila', '(02) 8524-1122', '7.1 km', 14.5712, 120.9934, true, true, 'Open 24 hours', ARRAY['Emergency', 'Surgery', 'Radiology', 'Laboratory', 'Blood Bank'], 4.8, true),
('Whiskers & Wags Animal Hospital', '258 Alabang-Zapote Rd, Almanza', 'Las Piñas', '(02) 8801-8901', '12.5 km', 14.4392, 121.0183, false, true, '8:00 AM – 6:00 PM', ARRAY['Vaccination', 'Spay/Neuter', 'X-Ray', 'Dental Checkup'], 4.2, true),
('San Juan Pet Health Haven', '88 N. Domingo St, Pedro Cruz', 'San Juan', '(02) 8723-4567', '3.4 km', 14.6045, 121.0289, false, true, '8:30 AM – 6:30 PM', ARRAY['General Checkup', 'Vaccination', 'Grooming', 'Pharmacy'], 4.5, true),
('Marikina Animal Center', '55 Shoe Ave, Sto. Niño', 'Marikina', '(02) 8941-8899', '4.9 km', 14.6391, 121.0988, true, true, '8:00 AM – 9:00 PM', ARRAY['Emergency', 'Surgery', 'Vaccination', 'Deworming', 'Ultrasound'], 4.7, true)
ON CONFLICT DO NOTHING;

