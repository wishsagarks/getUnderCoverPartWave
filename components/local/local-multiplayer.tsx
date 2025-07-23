"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/aceternity/card';
import { Button } from '@/components/aceternity/button';
import { Badge } from '@/components/aceternity/badge';
import { 
  UsersIcon, 
  PlayIcon, 
  SettingsIcon,
  ArrowLeftIcon,
  EyeIcon,
  MessageSquareIcon,
  VoteIcon,
  TrophyIcon
} from 'lucide-react';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  role: 'civilian' | 'undercover';
  word: string;
  isAlive: boolean;
  hasGivenClue: boolean;
  clue?: string;
}

interface WordPair {
  civilian: string;
  undercover: string;
}

const defaultWordPacks = [
  {
    id: 'general',
    title: 'General Pack',
    pairs: [
      { civilian: 'Apple', undercover: 'Orange' },
      { civilian: 'Cat', undercover: 'Dog' },
      { civilian: 'Coffee', undercover: 'Tea' },
      { civilian: 'Summer', undercover: 'Winter' },
      { civilian: 'Book', undercover: 'Magazine' },
      { civilian: 'Car', undercover: 'Bike' },
      { civilian: 'Pizza', undercover: 'Burger' },
      { civilian: 'Ocean', undercover: 'Lake' }
    ]
  },
  {
    id: 'technology',
    title: 'Technology',
    pairs: [
      { civilian: 'iPhone', undercover: 'Android' },
      { civilian: 'Netflix', undercover: 'YouTube' },
      { civilian: 'Instagram', undercover: 'TikTok' },
      { civilian: 'Tesla', undercover: 'BMW' },
      { civilian: 'Zoom', undercover: 'Teams' },
      { civilian: 'WhatsApp', undercover: 'Telegram' },
      { civilian: 'Google', undercover: 'Bing' }
    ]
  }
];

type GamePhase = 'setup' | 'playing' | 'clues' | 'voting' | 'results' | 'finished';

export function LocalMultiplayer() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerCount, setPlayerCount] = useState(6);
  const [selectedWordPack, setSelectedWordPack] = useState(defaultWordPacks[0]);
  const [currentWordPair, setCurrentWordPair] = useState<WordPair | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showWord, setShowWord] = useState(false);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [round, setRound] = useState(1);

  const setupGame = () => {
    // Generate player names
    const newPlayers: Player[] = [];
    for (let i = 1; i <= playerCount; i++) {
      newPlayers.push({
        id: `player-${i}`,
        name: `Player ${i}`,
        role: 'civilian',
        word: '',
        isAlive: true,
        hasGivenClue: false
      });
    }

    // Select random word pair
    const randomPair = selectedWordPack.pairs[Math.floor(Math.random() * selectedWordPack.pairs.length)];
    setCurrentWordPair(randomPair);

    // Assign roles (1 undercover for every 4 players, minimum 1)
    const undercoverCount = Math.max(1, Math.floor(playerCount / 4));
    const shuffledPlayers = [...newPlayers].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < undercoverCount; i++) {
      shuffledPlayers[i].role = 'undercover';
      shuffledPlayers[i].word = randomPair.undercover;
    }
    
    for (let i = undercoverCount; i < shuffledPlayers.length; i++) {
      shuffledPlayers[i].role = 'civilian';
      shuffledPlayers[i].word = randomPair.civilian;
    }

    setPlayers(shuffledPlayers);
    setGamePhase('playing');
    setCurrentPlayerIndex(0);
  };

  const nextPlayer = () => {
    const alivePlayers = players.filter(p => p.isAlive);
    const currentAliveIndex = alivePlayers.findIndex(p => p.id === players[currentPlayerIndex]?.id);
    const nextAliveIndex = (currentAliveIndex + 1) % alivePlayers.length;
    const nextPlayerGlobalIndex = players.findIndex(p => p.id === alivePlayers[nextAliveIndex].id);
    
    setCurrentPlayerIndex(nextPlayerGlobalIndex);
    setShowWord(false);
  };

  const submitClue = (clue: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].clue = clue;
    updatedPlayers[currentPlayerIndex].hasGivenClue = true;
    setPlayers(updatedPlayers);

    const alivePlayers = updatedPlayers.filter(p => p.isAlive);
    const allCluesGiven = alivePlayers.every(p => p.hasGivenClue);
    
    if (allCluesGiven) {
      setGamePhase('voting');
      setCurrentPlayerIndex(0);
    } else {
      nextPlayer();
    }
  };

  const resetGame = () => {
    setGamePhase('setup');
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setShowWord(false);
    setVotes({});
    setRound(1);
  };

  const alivePlayers = players.filter(p => p.isAlive);
  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Local Multiplayer
            </h1>
          </div>
          
          {gamePhase !== 'setup' && (
            <Button variant="outline" onClick={resetGame}>
              New Game
            </Button>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Setup Phase */}
          {gamePhase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    Game Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Player Count */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                      Number of Players
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                        <button
                          key={count}
                          onClick={() => setPlayerCount(count)}
                          className={`p-3 border rounded-lg text-center transition-all ${
                            playerCount === count
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="font-bold">{count}</div>
                          <div className="text-xs text-gray-500">players</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Word Pack Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                      Word Pack
                    </label>
                    <div className="space-y-3">
                      {defaultWordPacks.map((pack) => (
                        <div
                          key={pack.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedWordPack.id === pack.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                          onClick={() => setSelectedWordPack(pack)}
                        >
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {pack.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {pack.pairs.length} word pairs available
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Game Info */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Game Setup</h4>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span>Players:</span>
                        <span className="font-medium">{playerCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Undercover agents:</span>
                        <span className="font-medium">{Math.max(1, Math.floor(playerCount / 4))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Word pack:</span>
                        <span className="font-medium">{selectedWordPack.title}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={setupGame}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    size="lg"
                  >
                    <PlayIcon className="h-5 w-5 mr-2" />
                    Start Game
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Playing Phase */}
          {gamePhase === 'playing' && currentPlayer && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Game Status */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Round {round} - Clue Phase
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {alivePlayers.filter(p => p.hasGivenClue).length} / {alivePlayers.length} players have given clues
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Current Player */}
              <Card className="border-2 border-blue-500">
                <CardHeader>
                  <CardTitle className="text-center">
                    {currentPlayer.name}'s Turn
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Word Display */}
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowWord(!showWord)}
                      className="mb-4"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      {showWord ? 'Hide' : 'Show'} Your Word
                    </Button>
                    
                    <AnimatePresence>
                      {showWord && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg"
                        >
                          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {currentPlayer.word}
                          </p>
                          <Badge variant="outline">
                            You are: {currentPlayer.role}
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Clue Input */}
                  {!currentPlayer.hasGivenClue && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Give a one-word clue:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter your clue..."
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                if (input.value.trim()) {
                                  submitClue(input.value.trim());
                                }
                              }
                            }}
                          />
                          <Button
                            onClick={(e) => {
                              const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                              if (input?.value.trim()) {
                                submitClue(input.value.trim());
                              }
                            }}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                          >
                            Submit
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Give a clue related to your word, but don't make it too obvious!
                      </p>
                    </div>
                  )}

                  {currentPlayer.hasGivenClue && (
                    <div className="text-center">
                      <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                        You gave the clue: <strong>"{currentPlayer.clue}"</strong>
                      </p>
                      <Button onClick={nextPlayer}>
                        Next Player
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* All Clues */}
              {alivePlayers.some(p => p.hasGivenClue) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Clues Given So Far</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {alivePlayers.map((player) => (
                        <div
                          key={player.id}
                          className={`p-3 border rounded-lg ${
                            player.hasGivenClue
                              ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {player.name}
                          </p>
                          {player.hasGivenClue ? (
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              "{player.clue}"
                            </p>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                              Thinking...
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Voting Phase */}
          {gamePhase === 'voting' && (
            <motion.div
              key="voting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-center flex items-center justify-center gap-2">
                    <VoteIcon className="h-5 w-5" />
                    Voting Phase
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                    Discuss the clues and vote to eliminate who you think is the undercover agent!
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {alivePlayers.map((player) => (
                      <div
                        key={player.id}
                        className="p-4 border rounded-lg bg-white dark:bg-gray-800"
                      >
                        <p className="font-medium text-gray-900 dark:text-white mb-2">
                          {player.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          Clue: "{player.clue}"
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Vote to Eliminate
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <Button
                      onClick={() => setGamePhase('results')}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    >
                      Reveal Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results Phase */}
          {gamePhase === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-center flex items-center justify-center gap-2">
                    <TrophyIcon className="h-5 w-5" />
                    Game Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      The Words Were:
                    </h3>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Civilian Word</p>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
                          {currentWordPair?.civilian}
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400 mb-1">Undercover Word</p>
                        <p className="text-lg font-bold text-red-900 dark:text-red-300">
                          {currentWordPair?.undercover}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white text-center">
                      Player Roles:
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {players.map((player) => (
                        <div
                          key={player.id}
                          className={`p-3 rounded-lg text-center ${
                            player.role === 'undercover'
                              ? 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700'
                              : 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                          }`}
                        >
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {player.name}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-xs mt-1 ${
                              player.role === 'undercover'
                                ? 'border-red-300 text-red-700 dark:text-red-300'
                                : 'border-blue-300 text-blue-700 dark:text-blue-300'
                            }`}
                          >
                            {player.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center mt-6">
                    <Button
                      onClick={resetGame}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      Play Again
                    </Button>
                    <Link href="/">
                      <Button variant="outline">
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}