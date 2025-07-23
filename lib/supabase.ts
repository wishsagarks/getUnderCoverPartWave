import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

// Check if Supabase is properly configured
const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client-side supabase instance
export const createClientComponentClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Server-side supabase instance
export const createServerComponentClient = () => {
  return createClient(
    supabaseUrl,
    supabaseServiceRoleKey
  );
};

export { isSupabaseConfigured };

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          room_code: string;
          host_id: string;
          status: 'waiting' | 'playing' | 'finished';
          current_round: number;
          max_players: number;
          word_pack: string;
          civilian_word: string | null;
          undercover_word: string | null;
          config: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_code: string;
          host_id: string;
          status?: 'waiting' | 'playing' | 'finished';
          current_round?: number;
          max_players?: number;
          word_pack?: string;
          civilian_word?: string | null;
          undercover_word?: string | null;
          config?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_code?: string;
          host_id?: string;
          status?: 'waiting' | 'playing' | 'finished';
          current_round?: number;
          max_players?: number;
          word_pack?: string;
          civilian_word?: string | null;
          undercover_word?: string | null;
          config?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          username: string;
          role: 'civilian' | 'undercover';
          is_alive: boolean;
          has_given_clue: boolean;
          clue: string | null;
          score: number;
          joined_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          username: string;
          role?: 'civilian' | 'undercover';
          is_alive?: boolean;
          has_given_clue?: boolean;
          clue?: string | null;
          score?: number;
          joined_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          username?: string;
          role?: 'civilian' | 'undercover';
          is_alive?: boolean;
          has_given_clue?: boolean;
          clue?: string | null;
          score?: number;
          joined_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          room_id: string;
          voter_id: string;
          target_id: string;
          round: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          voter_id: string;
          target_id: string;
          round: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          voter_id?: string;
          target_id?: string;
          round?: number;
          created_at?: string;
        };
      };
      word_packs: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: 'curated' | 'custom' | 'community';
          owner_id: string | null;
          content: any;
          language: string;
          difficulty: 'easy' | 'medium' | 'hard';
          is_public: boolean;
          rating: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          type?: 'curated' | 'custom' | 'community';
          owner_id?: string | null;
          content: any;
          language?: string;
          difficulty?: 'easy' | 'medium' | 'hard';
          is_public?: boolean;
          rating?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          type?: 'curated' | 'custom' | 'community';
          owner_id?: string | null;
          content?: any;
          language?: string;
          difficulty?: 'easy' | 'medium' | 'hard';
          is_public?: boolean;
          rating?: number;
          created_at?: string;
        };
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          games_played: number;
          games_won: number;
          total_score: number;
          reminders_used: number;
          favorite_role: string | null;
          badges: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          games_played?: number;
          games_won?: number;
          total_score?: number;
          reminders_used?: number;
          favorite_role?: string | null;
          badges?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          games_played?: number;
          games_won?: number;
          total_score?: number;
          reminders_used?: number;
          favorite_role?: string | null;
          badges?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}