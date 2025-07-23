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
  EyeOffIcon,
  MessageSquareIcon,
  VoteIcon,
  TrophyIcon,
  ShuffleIcon,
  ClockIcon,
  UserIcon,
  CrownIcon,
  AlertCircleIcon,
  CheckCircleIcon
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
  remindersUsed: number;
}

interface WordPair {
  civilian: string;
  undercover: string;
}

const defaultWordPacks = [
  {
    id: 'general',
    title: 'General Pack',
    description: 'Basic words for everyday gameplay',
    difficulty: 'Easy',
    pairs: [
      { civilian: 'Apple', undercover: 'Orange' },
      { civilian: 'Cat', undercover: 'Dog' },
      { civilian: 'Coffee', undercover: 'Tea' },
      { civilian: 'Summer', undercover: 'Winter' },
      { civilian: 'Book', undercover: 'Magazine' },
      { civilian: 'Car', undercover: 'Bike' },
      { civilian: 'Pizza', undercover: 'Burger' },
      { civilian: 'Ocean', undercover: 'Lake' },
      { civilian: 'Phone', undercover: 'Computer' },
      { civilian: 'Rain', undercover: 'Snow' }
    ]
  },
  {
    id: 'technology',
    title: 'Technology Pack',
    description: 'Modern technology and gadgets',
    difficulty: 'Medium',
    pairs: [
      { civilian: 'iPhone', undercover: 'Android' },
      { civilian: 'Netflix', undercover: 'YouTube' },
      { civilian: 'Instagram', undercover: 'TikTok' },
      { civilian: 'Tesla', undercover: 'BMW' },
      { civilian: 'Zoom', undercover: 'Teams' },
      { civilian: 'WhatsApp', undercover: 'Telegram' },
      { civilian: 'Google', undercover: 'Bing' },
      { civilian: 'Spotify', undercover: 'Apple Music' },
      { civilian: 'Amazon', undercover: 'Flipkart' },
      { civilian: 'Facebook', undercover: 'Twitter' }
    ]
  },
  {
    id: 'indian',
    title: 'Indian Culture',
    description: 'Words related to Indian culture and traditions',
    difficulty: 'Medium',
    pairs: [
      { civilian: 'Dosa', undercover: 'Idli' },
      { civilian: 'Bollywood', undercover: 'Hollywood' },
      { civilian: 'Cricket', undercover: 'Football' },
      { civilian: 'Holi', undercover: 'Diwali' },
      { civilian: 'Taj Mahal', undercover: 'Red Fort' },
      { civilian: 'Biryani', undercover: 'Pulao' },
      { civilian: 'Sari', undercover: 'Lehenga' },
      { civilian: 'Mumbai', undercover: 'Delhi' },
      { civilian: 'Ganges', undercover: 'Yamuna' },
      { civilian: 'Rajasthan', undercover: 'Gujarat' }
    ]
  }
];

type GamePhase = 'setup' | 'privacy-check' | 'word-reveal' | 'clues' | 'voting' | 'results' | 'final-results';

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
  const [maxRounds] = useState(1);
  const [eliminatedThisRound, setEliminatedThisRound] = useState<Player[]>([]);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [clueInput, setClueInput] = useState('');

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
        hasGivenClue: false,
        remindersUsed: 0
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
    setGamePhase('privacy-check');
    setCurrentPlayerIndex(0);
    setGameStartTime(new Date());
  };

  const confirmPrivacy = () => {
    setGamePhase('word-reveal');
    setShowWord(true);
  };

  const nextPlayer = () => {
    const alivePlayers = players.filter(p => p.isAlive);
    const currentAliveIndex = alivePlayers.findIndex(p => p.id === players[currentPlayerIndex]?.id);
    const nextAliveIndex = (currentAliveIndex + 1) % alivePlayers.length;
    const nextPlayerGlobalIndex = players.findIndex(p => p.id === alivePlayers[nextAliveIndex].id);
    
    setCurrentPlayerIndex(nextPlayerGlobalIndex);
    setShowWord(false);
    setGamePhase('privacy-check');
    setClueInput('');
  };

  const submitClue = () => {
    if (!clueInput.trim()) return;
    
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].clue = clueInput.trim();
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

  const useReminder = () => {
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].remindersUsed += 1;
    setPlayers(updatedPlayers);
  };

  const simulateVoting = () => {
    // Simple voting simulation - eliminate random undercover or civilian
    const alivePlayers = players.filter(p => p.isAlive);
    const undercoverPlayers = alivePlayers.filter(p => p.role === 'undercover');
    const civilianPlayers = alivePlayers.filter(p => p.role === 'civilian');
    
    // 70% chance to eliminate undercover if any exist
    let toEliminate: Player;
    if (undercoverPlayers.length > 0 && Math.random() < 0.7) {
      toEliminate = undercoverPlayers[Math.floor(Math.random() * undercoverPlayers.length)];
    } else {
      toEliminate = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
    }

    const updatedPlayers = players.map(p => 
      p.id === toEliminate.id ? { ...p, isAlive: false } : p
    );
    
    setPlayers(updatedPlayers);
    setEliminatedThisRound([toEliminate]);
    setGamePhase('results');
  };

  const checkGameEnd = () => {
    const alivePlayers = players.filter(p => p.isAlive);
    const aliveUndercover = alivePlayers.filter(p => p.role === 'undercover');
    const aliveCivilians = alivePlayers.filter(p => p.role === 'civilian');

    if (aliveUndercover.length === 0) {
      // Civilians win
      setGamePhase('final-results');
      return true;
    } else if (aliveUndercover.length >= aliveCivilians.length) {
      // Undercover wins
      setGamePhase('final-results');
      return true;
    }
    return false;
  };

  const nextRound = () => {
    if (!checkGameEnd()) {
      // Reset for next round
      const updatedPlayers = players.map(p => ({
        ...p,
        hasGivenClue: false,
        clue: undefined
      }));
      setPlayers(updatedPlayers);
      setVotes({});
      setEliminatedThisRound([]);
      setRound(round + 1);
      setCurrentPlayerIndex(0);
      setGamePhase('privacy-check');
    }
  };

  const resetGame = () => {
    setGamePhase('setup');
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setShowWord(false);
    setVotes({});
    setRound(1);
    setEliminatedThisRound([]);
    setGameStartTime(null);
    setClueInput('');
  };

  const alivePlayers = players.filter(p => p.isAlive);
  const currentPlayer = players[currentPlayerIndex];
  const totalReminders = players.reduce((sum, p) => sum + p.remindersUsed, 0);

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
              <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Local Multiplayer
              </h1>
              {gamePhase !== 'setup' && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Round {round} • {alivePlayers.length} players alive
                </p>
              )}
            </div>
          </div>
          
          {gamePhase !== 'setup' && (
            <Button variant="outline" onClick={resetGame} className="hover:bg-red-50 hover:border-red-300 hover:text-red-600">
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
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                    <SettingsIcon className="h-5 w-5" />
                    Game Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Player Count */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block flex items-center gap-2">
                      <UsersIcon className="h-4 w-4" />
                      Number of Players
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                        <button
                          key={count}
                          onClick={() => setPlayerCount(count)}
                          className={`p-3 border rounded-lg text-center transition-all hover:scale-105 ${
                            playerCount === count
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                          }`}
                        >
                          <div className="font-bold text-lg">{count}</div>
                          <div className="text-xs text-gray-500">players</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Word Pack Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block flex items-center gap-2">
                      <ShuffleIcon className="h-4 w-4" />
                      Word Pack
                    </label>
                    <div className="space-y-3">
                      {defaultWordPacks.map((pack) => (
                        <div
                          key={pack.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${
                            selectedWordPack.id === pack.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                          }`}
                          onClick={() => setSelectedWordPack(pack)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                {pack.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                {pack.description}
                              </p>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {pack.difficulty}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {pack.pairs.length} pairs
                                </Badge>
                              </div>
                            </div>
                            {selectedWordPack.id === pack.id && (
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ml-3">
                                <CheckCircleIcon className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Game Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <AlertCircleIcon className="h-4 w-4 text-blue-500" />
                      Game Setup Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span>Players:</span>
                        <span className="font-medium">{playerCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Undercover:</span>
                        <span className="font-medium">{Math.max(1, Math.floor(playerCount / 4))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Word pack:</span>
                        <span className="font-medium">{selectedWordPack.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Difficulty:</span>
                        <span className="font-medium">{selectedWordPack.difficulty}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={setupGame}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    <PlayIcon className="h-5 w-5 mr-2" />
                    Start Game
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Privacy Check Phase */}
          {gamePhase === 'privacy-check' && currentPlayer && (
            <motion.div
              key="privacy-check"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center min-h-[60vh]"
            >
              <Card className="max-w-md w-full border-2 border-orange-200 dark:border-orange-800">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-orange-900 dark:text-orange-100">
                    Privacy Check
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <UserIcon className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Are you {currentPlayer.name}?
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Make sure only {currentPlayer.name} can see the screen before continuing.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setGamePhase('setup')}
                      className="flex-1"
                    >
                      No, Go Back
                    </Button>
                    <Button
                      onClick={confirmPrivacy}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    >
                      Yes, Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Word Reveal Phase */}
          {gamePhase === 'word-reveal' && currentPlayer && (
            <motion.div
              key="word-reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Current Player Card */}
              <Card className="border-2 border-green-200 dark:border-green-800">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-green-900 dark:text-green-100 flex items-center justify-center gap-2">
                    <CrownIcon className="h-6 w-6" />
                    {currentPlayer.name}'s Turn
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Word Display */}
                  <div className="text-center">
                    <div className="p-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border-2 border-dashed border-green-300 dark:border-green-700">
                      <p className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        {currentPlayer.word}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-lg px-4 py-2 ${
                          currentPlayer.role === 'undercover' 
                            ? 'border-red-300 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20' 
                            : 'border-blue-300 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20'
                        }`}
                      >
                        You are: {currentPlayer.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Reminder Button */}
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={useReminder}
                      className="mb-4 border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Use Word Reminder ({currentPlayer.remindersUsed} used)
                    </Button>
                  </div>

                  {/* Clue Input */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Give a one-word clue:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={clueInput}
                          onChange={(e) => setClueInput(e.target.value)}
                          placeholder="Enter your clue..."
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && submitClue()}
                        />
                        <Button
                          onClick={submitClue}
                          disabled={!clueInput.trim()}
                          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 px-6"
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      💡 Give a clue related to your word, but don't make it too obvious!
                    </p>
                  </div>

                  {/* Game Progress */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                      <span>Progress:</span>
                      <span>{alivePlayers.filter(p => p.hasGivenClue).length} / {alivePlayers.length} clues given</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(alivePlayers.filter(p => p.hasGivenClue).length / alivePlayers.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* All Clues Display */}
              {alivePlayers.some(p => p.hasGivenClue) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquareIcon className="h-5 w-5" />
                      Clues Given So Far
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {alivePlayers.map((player) => (
                        <div
                          key={player.id}
                          className={`p-3 border rounded-lg transition-all ${
                            player.hasGivenClue
                              ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                            {player.name}
                          </p>
                          {player.hasGivenClue ? (
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              "{player.clue}"
                            </p>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                              {player.id === currentPlayer.id ? 'Your turn...' : 'Waiting...'}
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
              <Card className="border-2 border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="text-center flex items-center justify-center gap-2 text-red-900 dark:text-red-100">
                    <VoteIcon className="h-5 w-5" />
                    Voting Phase
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                    🗣️ Discuss the clues and decide who to eliminate!
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {alivePlayers.map((player) => (
                      <div
                        key={player.id}
                        className="p-4 border rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-all"
                      >
                        <p className="font-medium text-gray-900 dark:text-white mb-2">
                          {player.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          Clue: "{player.clue}"
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Reminders used: {player.remindersUsed}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={simulateVoting}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3"
                      size="lg"
                    >
                      <VoteIcon className="h-5 w-5 mr-2" />
                      Reveal Elimination Results
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
              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-center text-purple-900 dark:text-purple-100">
                    Round {round} Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  {eliminatedThisRound.map((player) => (
                    <div key={player.id} className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                      <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                        {player.name} was eliminated!
                      </h3>
                      <p className="text-red-700 dark:text-red-300 mb-3">
                        They were: <strong>{player.role}</strong>
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Their word was: "{player.word}"
                      </p>
                    </div>
                  ))}

                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={nextRound}
                      className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6"
                    >
                      Continue Game
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Final Results Phase */}
          {gamePhase === 'final-results' && (
            <motion.div
              key="final-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="border-2 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="text-center flex items-center justify-center gap-2 text-yellow-900 dark:text-yellow-100">
                    <TrophyIcon className="h-6 w-6" />
                    Game Over!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Winner Announcement */}
                  <div className="text-center mb-8">
                    <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                      <h2 className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mb-4">
                        🎉 {players.filter(p => p.isAlive && p.role === 'undercover').length > 0 ? 'Undercover Wins!' : 'Civilians Win!'}
                      </h2>
                      <p className="text-yellow-700 dark:text-yellow-300">
                        {players.filter(p => p.isAlive && p.role === 'undercover').length > 0 
                          ? 'The undercover agents successfully infiltrated the group!'
                          : 'The civilians successfully identified all undercover agents!'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Word Reveal */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                      The Words Were:
                    </h3>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Civilian Word</p>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
                          {currentWordPair?.civilian}
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                        <p className="text-sm text-red-600 dark:text-red-400 mb-1">Undercover Word</p>
                        <p className="text-lg font-bold text-red-900 dark:text-red-300">
                          {currentWordPair?.undercover}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Player Summary */}
                  <div className="space-y-4 mb-8">
                    <h4 className="font-medium text-gray-900 dark:text-white text-center">
                      Final Player Summary:
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {players.map((player) => (
                        <div
                          key={player.id}
                          className={`p-3 rounded-lg text-center border ${
                            player.role === 'undercover'
                              ? 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700'
                              : 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                          } ${!player.isAlive ? 'opacity-60' : ''}`}
                        >
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {player.name} {!player.isAlive && '💀'}
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
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Reminders: {player.remindersUsed}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Game Stats */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 text-center">
                      📊 Game Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="text-center">
                        <p className="font-medium">Total Rounds</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{round}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">Reminders Used</p>
                        <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{totalReminders}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={resetGame}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6"
                    >
                      <PlayIcon className="h-5 w-5 mr-2" />
                      Play Again
                    </Button>
                    <Link href="/">
                      <Button variant="outline" className="px-6">
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