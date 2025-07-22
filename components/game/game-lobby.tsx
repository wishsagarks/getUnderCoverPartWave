"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/aceternity/card';
import { Button } from '@/components/aceternity/button';
import { Badge } from '@/components/aceternity/badge';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';
import { getWordPacks } from '@/lib/supabase';
import { 
  UsersIcon, 
  PlayIcon, 
  CopyIcon, 
  SettingsIcon,
  UserPlusIcon 
} from 'lucide-react';

interface GameLobbyProps {
  roomCode: string;
}

export function GameLobby({ roomCode }: GameLobbyProps) {
  const { user } = useAuth();
  const { room, players, currentPlayer, startGame } = useGame(roomCode);
  const [wordPacks, setWordPacks] = useState<any[]>([]);
  const [selectedWordPack, setSelectedWordPack] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchWordPacks = async () => {
      const { data } = await getWordPacks();
      if (data) {
        setWordPacks(data);
        setSelectedWordPack(data[0]); // Default to first pack
      }
    };
    fetchWordPacks();
  }, []);

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = async () => {
    if (!selectedWordPack) return;
    const { error } = await startGame(selectedWordPack);
    if (error) {
      console.error('Failed to start game:', error);
    }
  };

  const isHost = user?.id === room?.host_id;
  const canStart = players.length >= 3 && isHost;

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Room not found
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            The room code might be invalid or expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-4">
            Game Lobby
          </h1>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <Card className="px-6 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Room Code:
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-wider">
                  {roomCode}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyRoomCode}
                  className="ml-2"
                >
                  <CopyIcon className="h-4 w-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </Card>
            
            <Badge variant="secondary" className="px-4 py-2">
              <UsersIcon className="h-4 w-4 mr-2" />
              {players.length}/{room.max_players} Players
            </Badge>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Players List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlusIcon className="h-5 w-5" />
                  Players in Room
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {player.username}
                        </p>
                        {player.user_id === room.host_id && (
                          <Badge variant="secondary" className="text-xs">
                            Host
                          </Badge>
                        )}
                      </div>
                      {player.user_id === user?.id && (
                        <Badge variant="outline" className="text-xs">
                          You
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                  
                  {/* Empty slots */}
                  {Array.from({ length: room.max_players - players.length }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <UserPlusIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Waiting for player...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Settings */}
          <div className="space-y-6">
            {/* Word Pack Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Word Pack
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {wordPacks.map((pack) => (
                  <div
                    key={pack.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedWordPack?.id === pack.id
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => isHost && setSelectedWordPack(pack)}
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {pack.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {pack.description}
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {pack.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {pack.difficulty}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {!isHost && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Only the host can change game settings
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Start Game */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {canStart 
                        ? 'Ready to start the game!' 
                        : `Need at least 3 players to start (${players.length}/3)`
                      }
                    </p>
                    
                    {isHost ? (
                      <Button
                        onClick={handleStartGame}
                        disabled={!canStart}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                        size="lg"
                      >
                        <PlayIcon className="h-5 w-5 mr-2" />
                        Start Game
                      </Button>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Waiting for host to start the game...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-500 font-bold">1.</span>
                    <span>Everyone gets a secret word</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-500 font-bold">2.</span>
                    <span>Give clues about your word</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-500 font-bold">3.</span>
                    <span>Vote to eliminate the undercover</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-500 font-bold">4.</span>
                    <span>Civilians win if they find all undercover agents</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}