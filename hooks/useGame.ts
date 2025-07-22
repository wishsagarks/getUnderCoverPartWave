"use client";

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface Room {
  id: string;
  room_code: string;
  host_id: string;
  status: 'waiting' | 'playing' | 'finished';
  current_round: number;
  max_players: number;
  civilian_word?: string;
  undercover_word?: string;
}

interface Player {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  role: 'civilian' | 'undercover';
  is_alive: boolean;
  has_given_clue: boolean;
  clue?: string;
  score: number;
}

interface Vote {
  id: string;
  room_id: string;
  voter_id: string;
  target_id: string;
  round: number;
}

export function useGame(roomCode: string) {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const fetchGameData = useCallback(async () => {
    if (!roomCode || !user) return;

    try {
      // Get room data
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single();

      if (roomError) throw roomError;

      // Get players data
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomData.id)
        .order('joined_at');

      if (playersError) throw playersError;

      // Get votes data
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('*')
        .eq('room_id', roomData.id)
        .eq('round', roomData.current_round);

      if (votesError) throw votesError;

      setRoom(roomData);
      setPlayers(playersData || []);
      setVotes(votesData || []);
      
      const currentPlayerData = playersData?.find(p => p.user_id === user.id);
      setCurrentPlayer(currentPlayerData || null);
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  }, [roomCode, user, supabase]);

  useEffect(() => {
    fetchGameData();
    
    // Set up real-time subscriptions
    const roomSubscription = supabase
      .channel(`room-${roomCode}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `room_code=eq.${roomCode}` },
        () => fetchGameData()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        () => fetchGameData()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => fetchGameData()
      )
      .subscribe();

    return () => {
      roomSubscription.unsubscribe();
    };
  }, [fetchGameData, roomCode, supabase]);

  const submitClue = useCallback(async (clue: string) => {
    if (!currentPlayer) return { error: 'Not in game' };

    try {
      const { error } = await supabase
        .from('players')
        .update({ clue, has_given_clue: true })
        .eq('id', currentPlayer.id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to submit clue' };
    }
  }, [currentPlayer, supabase]);

  const submitVote = useCallback(async (targetPlayerId: string) => {
    if (!currentPlayer || !room) return { error: 'Not in game' };

    try {
      const { error } = await supabase
        .from('votes')
        .insert({
          room_id: room.id,
          voter_id: currentPlayer.id,
          target_id: targetPlayerId,
          round: room.current_round
        });

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to submit vote' };
    }
  }, [currentPlayer, room, supabase]);

  const startGame = useCallback(async (wordPack: any) => {
    if (!room || !currentPlayer || room.host_id !== user?.id) {
      return { error: 'Not authorized' };
    }

    try {
      // Get alive players
      const alivePlayers = players.filter(p => p.is_alive);
      const undercoverCount = Math.max(1, Math.floor(alivePlayers.length / 4));
      const shuffled = [...alivePlayers].sort(() => Math.random() - 0.5);
      
      // Select random word pair
      const wordPairs = wordPack.content.pairs;
      const selectedPair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
      
      // Update room with words and status
      const { error: roomError } = await supabase
        .from('rooms')
        .update({
          status: 'playing',
          civilian_word: selectedPair.civilian,
          undercover_word: selectedPair.undercover
        })
        .eq('id', room.id);

      if (roomError) throw roomError;

      // Assign roles to players
      for (let i = 0; i < alivePlayers.length; i++) {
        const role = i < undercoverCount ? 'undercover' : 'civilian';
        const { error: playerError } = await supabase
          .from('players')
          .update({ role })
          .eq('id', shuffled[i].id);

        if (playerError) throw playerError;
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to start game' };
    }
  }, [room, currentPlayer, user, players, supabase]);

  return {
    room,
    players,
    votes,
    currentPlayer,
    loading,
    error,
    submitClue,
    submitVote,
    startGame
  };
}