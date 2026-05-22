export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type UserRole = "voter" | "admin" | "super_admin" | "candidate";
export type ElectionStatus = "upcoming" | "active" | "closed" | "announced";
export type CandidateStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  name: string | null;
  father_name: string | null;
  cnic: string | null;
  date_of_birth: string | null;
  address: string | null;
  village: string | null;
  city: string | null;
  education: string | null;
  phone: string | null;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
}

export interface Election {
  id: string;
  title: string;
  description: string | null;
  position: string;
  location: string;
  max_voters: number | null;
  start_date: string;
  end_date: string;
  status: ElectionStatus;
  winner_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Candidate {
  id: string;
  election_id: string;
  profile_id: string;
  vote_count: number;
  status: CandidateStatus;
  created_at: string;
  profiles?: Profile;
  elections?: Election;
}

export interface Vote {
  id: string;
  election_id: string;
  candidate_id: string;
  created_at: string;
}

export interface VoterParticipation {
  voter_id: string;
  election_id: string;
  voted_at: string;
}

export interface AuthLog {
  id: string;
  user_id: string | null;
  attempt_time: string;
  status: string;
  ip_address: string | null;
}

export function isVoterProfileComplete(p: Profile): boolean {
  return !!(p.name && p.father_name && p.cnic && p.date_of_birth && p.address);
}

export function isCandidateProfileComplete(p: Profile): boolean {
  return !!(p.name && p.father_name && p.cnic && p.date_of_birth && p.address && p.education);
}
