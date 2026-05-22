-- ============================================================
-- Online Voting System (OVS) - Supabase Database Schema
-- University: Islamia University of Bahawalpur
-- Student: Nayab SanaUllah (F22BSEEN1E02099)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name        TEXT NOT NULL,
  cnic        TEXT UNIQUE NOT NULL,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'voter'
                CHECK (role IN ('voter', 'admin', 'commissioner')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ELECTIONS TABLE
-- ============================================================
CREATE TABLE public.elections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  start_date  TIMESTAMPTZ NOT NULL,
  end_date    TIMESTAMPTZ NOT NULL,
  status      TEXT NOT NULL DEFAULT 'upcoming'
                CHECK (status IN ('upcoming', 'active', 'closed')),
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CANDIDATES TABLE
-- ============================================================
CREATE TABLE public.candidates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  party       TEXT,
  symbol      TEXT,
  bio         TEXT,
  vote_count  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VOTES TABLE (anonymized — no direct voter link stored)
-- ============================================================
CREATE TABLE public.votes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id  UUID NOT NULL REFERENCES public.elections(id),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VOTER PARTICIPATION (prevents double voting, kept separate)
-- ============================================================
CREATE TABLE public.voter_participation (
  voter_id    UUID NOT NULL REFERENCES auth.users(id),
  election_id UUID NOT NULL REFERENCES public.elections(id),
  voted_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (voter_id, election_id)
);

-- ============================================================
-- AUTH LOGS
-- ============================================================
CREATE TABLE public.auth_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id),
  attempt_time TIMESTAMPTZ DEFAULT NOW(),
  status       TEXT NOT NULL,
  ip_address   TEXT
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own, admins read all
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','commissioner'))
  );

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Elections: anyone authenticated can read, only admins/commissioners can write
CREATE POLICY "Authenticated read elections"
  ON public.elections FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins manage elections"
  ON public.elections FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','commissioner'))
  );

-- Candidates: anyone authenticated can read
CREATE POLICY "Authenticated read candidates"
  ON public.candidates FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins manage candidates"
  ON public.candidates FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','commissioner'))
  );

-- Votes: anyone authenticated can insert, admins can read
CREATE POLICY "Authenticated insert votes"
  ON public.votes FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Admins read votes"
  ON public.votes FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','commissioner'))
  );

-- Public vote counts via candidates table (read only for all authenticated)
CREATE POLICY "Authenticated read vote counts"
  ON public.candidates FOR SELECT
  TO authenticated USING (true);

-- Voter participation: voters manage own record, admins read all
CREATE POLICY "Voters manage own participation"
  ON public.voter_participation FOR ALL
  USING (auth.uid() = voter_id);

CREATE POLICY "Admins read participation"
  ON public.voter_participation FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','commissioner'))
  );

-- Auth logs: admins only
CREATE POLICY "Admins read auth logs"
  ON public.auth_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','commissioner'))
  );

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update election status based on dates
CREATE OR REPLACE FUNCTION public.update_election_status()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.elections
  SET status = CASE
    WHEN NOW() < start_date THEN 'upcoming'
    WHEN NOW() BETWEEN start_date AND end_date THEN 'active'
    ELSE 'closed'
  END;
END;
$$;

-- Increment candidate vote count atomically when a vote is cast
CREATE OR REPLACE FUNCTION public.increment_vote_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.candidates
  SET vote_count = vote_count + 1
  WHERE id = NEW.candidate_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_vote_inserted
  AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.increment_vote_count();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, cnic, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'cnic', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'voter')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SEED DATA (Demo elections and admin account)
-- ============================================================

-- Insert a sample election (adjust dates as needed)
INSERT INTO public.elections (title, description, start_date, end_date, status) VALUES
(
  'General Election 2025',
  'National assembly elections for the year 2025. Cast your vote for your preferred candidate.',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '7 days',
  'active'
),
(
  'Provincial Council Election',
  'Provincial council elections for local governance representation.',
  NOW() + INTERVAL '10 days',
  NOW() + INTERVAL '17 days',
  'upcoming'
);
