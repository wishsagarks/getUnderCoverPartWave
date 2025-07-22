"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/aceternity/card';
import { Button } from '@/components/aceternity/button';
import { Badge } from '@/components/aceternity/badge';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';
import { 
  EyeIcon, 
  MessageSquareIcon, 
  VoteIcon, 
  ClockIcon,
  UserIcon,
  CrownIcon
} from 'lucide-react';

interface GameRoomProps {
  roomCode: string;
}

export function GameRoom({ roomCode }: GameRoomProps) {
  const { user } = useAuth();
  const { room, players, votes, currentPlayer, submitClue, submitVote } = useGame(roomCode);
  const [showWord, setShowWord] = useState(false);
  const [clueInput, setClueInput] = useState('');
  const [selectedVoteTarget, setSelectedVoteTarget] = useState<string>('');
  const [gamePhase, setGamePhase] = useState<'clues' | 'discussion' | 'voting' | 'results'>('clues');

  const alivePlayers = players.filter(p => p.is_alive);
  const deadPlayers = players.filter(p => !p.is_alive);
  const playersWithClues = alivePlayers.filter(p => p.has_given_clue);
  const currentUserWord = currentPlayer?.role === 'civilian' ? room?.civilian_word : room?.undercover_word;

  // Determine game phase
  useEffect(() => {
    if (!room || room.status !== 'playing') return;

    const allCluesGiven = alivePlayers.length > 0 && alivePlayers.every(p => p.has_given_clue);
    const allVotesCast = alivePlayers.length > 0 && votes.length === alivePlayers.length;

    if (!allCluesGiven) {
      setGamePhase('clues');
    } else if (!allVotesCast) {
      setGamePhase('voting');
    } else {
      setGamePhase('results');
    }
  }, [alivePlayers, votes]);

  const handleSubmitClue = async () => {
    if (!clueInput.trim()) return;
    
    const { error } = await submitClue(clueInput.trim());
    if (!error) {
      setClueInput('');
    }
  };

  const handleSubmitVote = async () => {
    if (!selectedVoteTarget) return;
    
    const { error } = await submitVote(selectedVoteTarget);
    if (!error) {
      setSelectedVoteTarget('');
    }
  };

  const getPlayerVote = (playerId: string) => {
    return votes.find(v => v.voter_id === playerId);
  };

  const getVoteCount = (targetId: string) => {
    return votes.filter(v => v.target_id === targetId).length;
  };

  if (!room || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Loading game...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Room {roomCode}
            </h1>
            <Badge variant="secondary">
              Round {room.current_round}
            </Badge>
          </div>
          
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {alivePlayers.length} alive
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {gamePhase === 'clues' && 'Giving Clues'}
                {gamePhase === 'voting' && 'Voting Phase'}
                {gamePhase === 'results' && 'Round Results'}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Your Word */}
            <Card className="border-2 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Secret Word</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWord(!showWord)}
                    className="flex items-center gap-2"
                  >
                    <EyeIcon className="h-4 w-4" />
                    {showWord ? 'Hide' : 'Show'} Word
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {showWord && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center p-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg"
                    >
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {currentUserWord}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        You are: <Badge variant="outline">{currentPlayer.role}</Badge>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {!showWord && (
                  <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">
                      Click "Show Word" to reveal your secret word
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Clue Input */}
            {gamePhase === 'clues' && currentPlayer.is_alive && !currentPlayer.has_given_clue && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquareIcon className="h-5 w-5" />
                    Give Your Clue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={clueInput}
                      onChange={(e) => setClueInput(e.target.value)}
                      placeholder="Enter a one-word clue..."
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmitClue()}
                    />
                    <Button
                      onClick={handleSubmitClue}
                      disabled={!clueInput.trim()}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    >
                      Submit Clue
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Give a one-word clue related to your word. Be strategic!
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Voting */}
            {gamePhase === 'voting' && currentPlayer.is_alive && !getPlayerVote(currentPlayer.id) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <VoteIcon className="h-5 w-5" />
                    Vote to Eliminate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {alivePlayers
                      .filter(p => p.id !== currentPlayer.id)
                      .map((player) => (
                        <button
                          key={player.id}
                          onClick={() => setSelectedVoteTarget(player.id)}
                          className={`p-3 border rounded-lg text-left transition-all ${
                            selectedVoteTarget === player.id
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <p className="font-medium text-gray-900 dark:text-white">
                            {player.username}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Clue: "{player.clue}"
                          </p>
                        </button>
                      ))}
                  </div>
                  
                  <Button
                    onClick={handleSubmitVote}
                    disabled={!selectedVoteTarget}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  >
                    Cast Vote
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* All Clues Display */}
            <Card>
              <CardHeader>
                <CardTitle>Player Clues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {alivePlayers.map((player) => (
                    <div
                      key={player.id}
                      className={`p-4 border rounded-lg ${
                        player.has_given_clue
                          ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {player.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {player.username}
                        </span>
                        {player.user_id === room.host_id && (
                          <CrownIcon className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      
                      {player.has_given_clue ? (
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          "{player.clue}"
                        </p>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          Thinking...
                        </p>
                      )}
                      
                      {gamePhase === 'voting' && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {getVoteCount(player.id)} votes
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Game Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Phase:</span>
                    <Badge variant="secondary">
                      {gamePhase === 'clues' && 'Clues'}
                      {gamePhase === 'voting' && 'Voting'}
                      {gamePhase === 'results' && 'Results'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Clues:</span>
                    <span className="text-sm font-medium">
                      {playersWithClues.length}/{alivePlayers.length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Votes:</span>
                    <span className="text-sm font-medium">
                      {votes.length}/{alivePlayers.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eliminated Players */}
            {deadPlayers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Eliminated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {deadPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded"
                      >
                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                          {player.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {player.username}
                        </span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          {player.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWord(!showWord)}
                    className="w-full"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    {showWord ? 'Hide' : 'Show'} My Word
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(roomCode)}
                    className="w-full"
                  >
                    Share Room Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}