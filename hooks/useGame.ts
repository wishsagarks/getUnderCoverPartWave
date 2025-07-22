"use client";

import { useEffect, useState, useCallback } from 'react';
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

  const fetchGameData = useCallback(async () => {
    if (!roomCode) return;

    try {
      const response = await fetch(`/api/game/${roomCode}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch game data');
      }

      const data = await response.json();
      setRoom(data.room);
      setPlayers(data.players);
      setVotes(data.votes || []);
      
      if (user) {
        const currentPlayerData = data.players.find((p: Player) => p.user_id === user.id);
        setCurrentPlayer(currentPlayerData || null);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  }, [roomCode, user]);

  useEffect(() => {
    fetchGameData();
    
    // Poll for updates every 2 seconds (simple polling instead of real-time)
    const interval = setInterval(fetchGameData, 2000);
    
    return () => clearInterval(interval);
  }, [fetchGameData]);

  const submitClue = useCallback(async (clue: string) => {
    if (!currentPlayer) return { error: 'Not in game' };

    try {
      const response = await fetch('/api/game/clue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ playerId: currentPlayer.id, clue })
      });

      if (!response.ok) {
        throw new Error('Failed to submit clue');
      }

      await fetchGameData(); // Refresh data
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to submit clue' };
    }
  }, [currentPlayer, fetchGameData]);

  const submitVote = useCallback(async (targetPlayerId: string) => {
    if (!currentPlayer || !room) return { error: 'Not in game' };

    try {
      const response = await fetch('/api/game/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          roomId: room.id,
          voterId: currentPlayer.id,
          targetId: targetPlayerId,
          round: room.current_round
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      await fetchGameData(); // Refresh data
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to submit vote' };
    }
  }, [currentPlayer, room, fetchGameData]);

  const startGame = useCallback(async (wordPack: any) => {
    if (!room || !currentPlayer) return { error: 'Not authorized' };

    try {
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ roomId: room.id, wordPack })
      });

      if (!response.ok) {
        throw new Error('Failed to start game');
      }

      await fetchGameData(); // Refresh data
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to start game' };
    }
  }, [room, currentPlayer, fetchGameData]);

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