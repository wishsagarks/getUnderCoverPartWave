import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          room_code: string;
          host_id: string;
          status: 'waiting' | 'playing' | 'finished';
          current_round: number;
          max_players: number;
          word_pack: string;
          civilian_word: string;
          undercover_word: string;
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
          civilian_word?: string;
          undercover_word?: string;
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
          civilian_word?: string;
          undercover_word?: string;
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
    };
  };
};