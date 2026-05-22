-- ============================================================
-- Online Voting System (OVS) - Supabase Database Schema v2
-- University: Islamia University of Bahawalpur
-- Student: Nayab SanaUllah (F22BSEEN1E02099)
-- Roles: voter, candidate, admin, super_admin
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name          TEXT,
  father_name   TEXT,
  cnic          TEXT UNIQUE,
  date_of_birth DATE,
  address       TEXT,
  village       TEXT,
  city          TEXT,
  education     TEXT,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'voter'
                  CHECK (role IN ('voter', 'admin', 'super_admin', 'candidate')),
  is_verified   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ELECTIONS TABLE
-- ============================================================
CREATE TABLE public.elections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  position    TEXT NOT NULL,     -- e.g. MNA Seat, Mayor, Student President
  location    TEXT NOT NULL,     -- constituency / city
  max_voters  INTEGER,           -- auto-announce winner when this many votes cast
  start_date  TIMESTAMPTZ NOT NULL,
  end_date    TIMESTAMPTZ NOT NULL,
  status      TEXT NOT NULL DEFAULT 'upcoming'
                CHECK (status IN ('upcoming', 'active', 'closed', 'announced')),
  winner_id   UUID REFERENCES public.profiles(id),
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CANDIDATES TABLE (profiles with candidate role in an election)
-- ============================================================
CREATE TABLE public.candidates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id  UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  profile_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_count   INTEGER DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(election_id, profile_id)
);

-- ============================================================
-- VOTES TABLE (anonymous — no direct voter link)
-- ============================================================
CREATE TABLE public.votes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id  UUID NOT NULL REFERENCES public.elections(id),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VOTER PARTICIPATION (prevents double voting)
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
-- SECURITY DEFINER HELPER — avoids infinite recursion in RLS
-- Must be created BEFORE the policies that use it.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_logs         ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Anyone can read approved candidate profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.profile_id = public.profiles.id AND c.status = 'approved'
    )
  );

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role insert profiles"
  ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Super admin update any profile"
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() = 'super_admin');

-- Elections
CREATE POLICY "Anyone authenticated can read elections"
  ON public.elections FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public can read announced elections"
  ON public.elections FOR SELECT USING (status IN ('announced', 'closed'));

CREATE POLICY "Admins manage elections"
  ON public.elections FOR ALL
  USING (public.get_my_role() IN ('admin', 'super_admin'));

-- Candidates
CREATE POLICY "Anyone authenticated reads candidates"
  ON public.candidates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Candidate can apply"
  ON public.candidates FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Admins manage candidates"
  ON public.candidates FOR ALL
  USING (public.get_my_role() IN ('admin', 'super_admin'));

-- Votes
CREATE POLICY "Authenticated can vote"
  ON public.votes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins read votes"
  ON public.votes FOR SELECT
  USING (public.get_my_role() IN ('admin', 'super_admin'));

-- Voter participation
CREATE POLICY "Voters manage own participation"
  ON public.voter_participation FOR ALL USING (auth.uid() = voter_id);

CREATE POLICY "Admins read participation"
  ON public.voter_participation FOR SELECT
  USING (public.get_my_role() IN ('admin', 'super_admin'));

-- Auth logs
CREATE POLICY "Admins read auth logs"
  ON public.auth_logs FOR SELECT
  USING (public.get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "System insert auth logs"
  ON public.auth_logs FOR INSERT WITH CHECK (true);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup (cnic defaults to UUID to satisfy UNIQUE)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, cnic, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), NULL),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'cnic', ''), NEW.id::text),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), NULL),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'voter')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Increment vote count atomically
CREATE OR REPLACE FUNCTION public.increment_vote_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
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

-- Auto-announce winner when max_voters reached
CREATE OR REPLACE FUNCTION public.check_announce_election()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_election public.elections%ROWTYPE;
  v_total    INTEGER;
  v_winner   UUID;
BEGIN
  SELECT * INTO v_election FROM public.elections WHERE id = NEW.election_id;

  IF v_election.status = 'announced' THEN RETURN NEW; END IF;
  IF v_election.max_voters IS NULL THEN RETURN NEW; END IF;

  SELECT COUNT(*) INTO v_total
  FROM public.voter_participation WHERE election_id = NEW.election_id;

  IF v_total >= v_election.max_voters THEN
    SELECT profile_id INTO v_winner
    FROM public.candidates
    WHERE election_id = NEW.election_id AND status = 'approved'
    ORDER BY vote_count DESC LIMIT 1;

    UPDATE public.elections
    SET status = 'announced', winner_id = v_winner
    WHERE id = NEW.election_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_participation_inserted
  AFTER INSERT ON public.voter_participation
  FOR EACH ROW EXECUTE FUNCTION public.check_announce_election();

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO public.elections (title, description, position, location, max_voters, start_date, end_date, status) VALUES
(
  'General Election 2025',
  'National assembly elections for the year 2025.',
  'MNA Seat NA-001',
  'Bahawalpur',
  1000,
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '7 days',
  'active'
),
(
  'Provincial Council Election',
  'Provincial council elections for local governance.',
  'MPA Seat PP-001',
  'Lahore',
  500,
  NOW() + INTERVAL '10 days',
  NOW() + INTERVAL '17 days',
  'upcoming'
);
