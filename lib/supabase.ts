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
          type: 'curated' | 'custom' | 'ai';
          owner_id: string | null;
          content: any;
          language: string;
          difficulty: string;
          is_public: boolean;
          rating: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          type?: 'curated' | 'custom' | 'ai';
          owner_id?: string | null;
          content: any;
          language?: string;
          difficulty?: string;
          is_public?: boolean;
          rating?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          type?: 'curated' | 'custom' | 'ai';
          owner_id?: string | null;
          content?: any;
          language?: string;
          difficulty?: string;
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
          favorite_role: 'civilian' | 'undercover' | null;
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
          favorite_role?: 'civilian' | 'undercover' | null;
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
          favorite_role?: 'civilian' | 'undercover' | null;
          badges?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// Auth helpers
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/game`
    }
  });
  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signUpWithEmail = async (email: string, password: string, username: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username
      }
    }
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Game helpers
export const createRoom = async (hostId: string, maxPlayers: number = 8) => {
  const { data, error } = await supabase.rpc('generate_room_code');
  if (error) return { data: null, error };
  
  const roomCode = data;
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert({
      room_code: roomCode,
      host_id: hostId,
      max_players: maxPlayers
    })
    .select()
    .single();
    
  return { data: room, error: roomError };
};

export const joinRoom = async (roomCode: string, userId: string, username: string) => {
  // First check if room exists and has space
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*, players(count)')
    .eq('room_code', roomCode)
    .single();
    
  if (roomError) return { data: null, error: roomError };
  if (!room) return { data: null, error: new Error('Room not found') };
  
  const playerCount = room.players?.[0]?.count || 0;
  if (playerCount >= room.max_players) {
    return { data: null, error: new Error('Room is full') };
  }
  
  // Join the room
  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({
      room_id: room.id,
      user_id: userId,
      username: username
    })
    .select()
    .single();
    
  return { data: { room, player }, error: playerError };
};

export const getWordPacks = async () => {
  const { data, error } = await supabase
    .from('word_packs')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });
    
  return { data, error };
};

export const getUserStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  return { data, error };
};