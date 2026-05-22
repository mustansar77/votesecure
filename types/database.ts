export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          cnic: string;
          phone: string | null;
          role: "voter" | "admin" | "commissioner";
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          cnic: string;
          phone?: string | null;
          role?: "voter" | "admin" | "commissioner";
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          cnic?: string;
          phone?: string | null;
          role?: "voter" | "admin" | "commissioner";
          is_verified?: boolean;
        };
      };
      elections: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string;
          status: "upcoming" | "active" | "closed";
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          status?: "upcoming" | "active" | "closed";
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          status?: "upcoming" | "active" | "closed";
        };
      };
      candidates: {
        Row: {
          id: string;
          election_id: string;
          name: string;
          party: string | null;
          symbol: string | null;
          bio: string | null;
          vote_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          name: string;
          party?: string | null;
          symbol?: string | null;
          bio?: string | null;
          vote_count?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          party?: string | null;
          symbol?: string | null;
          bio?: string | null;
          vote_count?: number;
        };
      };
      votes: {
        Row: {
          id: string;
          election_id: string;
          candidate_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          candidate_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      voter_participation: {
        Row: {
          voter_id: string;
          election_id: string;
          voted_at: string;
        };
        Insert: {
          voter_id: string;
          election_id: string;
          voted_at?: string;
        };
        Update: Record<string, never>;
      };
      auth_logs: {
        Row: {
          id: string;
          user_id: string | null;
          attempt_time: string;
          status: string;
          ip_address: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          attempt_time?: string;
          status: string;
          ip_address?: string | null;
        };
        Update: Record<string, never>;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Election = Database["public"]["Tables"]["elections"]["Row"];
export type Candidate = Database["public"]["Tables"]["candidates"]["Row"];
export type Vote = Database["public"]["Tables"]["votes"]["Row"];
export type AuthLog = Database["public"]["Tables"]["auth_logs"]["Row"];
