import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type Room = Database['public']['Tables']['rooms']['Row'];
type Player = Database['public']['Tables']['players']['Row'];
type Vote = Database['public']['Tables']['votes']['Row'];

export function useGame(roomCode: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to room changes
  useEffect(() => {
    if (!roomCode) return;

    const fetchInitialData = async () => {
      try {
        // Get room data
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('room_code', roomCode)
          .single();

        if (roomError) throw roomError;
        setRoom(roomData);

        // Get players
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('room_id', roomData.id)
          .order('joined_at');

        if (playersError) throw playersError;
        setPlayers(playersData);

        // Get current user's player data
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const currentPlayerData = playersData.find(p => p.user_id === user.id);
          setCurrentPlayer(currentPlayerData || null);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchInitialData();

    // Subscribe to real-time changes
    const roomChannel = supabase
      .channel(`room:${roomCode}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `room_code=eq.${roomCode}` },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setRoom(payload.new as Room);
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        async (payload) => {
          // Refresh players when any player changes
          const { data: playersData } = await supabase
            .from('players')
            .select('*')
            .eq('room_id', room?.id)
            .order('joined_at');
          
          if (playersData) {
            setPlayers(playersData);
            
            // Update current player if it's them
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const currentPlayerData = playersData.find(p => p.user_id === user.id);
              setCurrentPlayer(currentPlayerData || null);
            }
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        async (payload) => {
          // Refresh votes
          const { data: votesData } = await supabase
            .from('votes')
            .select('*')
            .eq('room_id', room?.id)
            .eq('round', room?.current_round || 1);
          
          if (votesData) {
            setVotes(votesData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [roomCode, room?.id, room?.current_round]);

  const submitClue = useCallback(async (clue: string) => {
    if (!currentPlayer) return { error: 'Not in game' };

    const { error } = await supabase
      .from('players')
      .update({ 
        clue: clue,
        has_given_clue: true 
      })
      .eq('id', currentPlayer.id);

    return { error };
  }, [currentPlayer]);

  const submitVote = useCallback(async (targetPlayerId: string) => {
    if (!currentPlayer || !room) return { error: 'Not in game' };

    const { error } = await supabase
      .from('votes')
      .insert({
        room_id: room.id,
        voter_id: currentPlayer.id,
        target_id: targetPlayerId,
        round: room.current_round
      });

    return { error };
  }, [currentPlayer, room]);

  const startGame = useCallback(async (wordPack: any) => {
    if (!room || !currentPlayer) return { error: 'Not authorized' };

    // Assign roles randomly
    const alivePlayers = players.filter(p => p.is_alive);
    const undercoverCount = Math.max(1, Math.floor(alivePlayers.length / 4));
    const shuffled = [...alivePlayers].sort(() => Math.random() - 0.5);
    
    // Select random word pair from pack
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

    if (roomError) return { error: roomError };

    // Assign roles to players
    for (let i = 0; i < alivePlayers.length; i++) {
      const role = i < undercoverCount ? 'undercover' : 'civilian';
      await supabase
        .from('players')
        .update({ role })
        .eq('id', shuffled[i].id);
    }

    return { error: null };
  }, [room, currentPlayer, players]);

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