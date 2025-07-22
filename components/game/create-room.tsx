"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/aceternity/card';
import { Button } from '@/components/aceternity/button';
import { Badge } from '@/components/aceternity/badge';
import { createRoom, getWordPacks } from '@/lib/supabase';
import { getAuthToken } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { 
  PlusIcon, 
  UsersIcon, 
  SettingsIcon,
  PlayIcon 
} from 'lucide-react';

export function CreateRoom() {
  const { user } = useAuth();
  const router = useRouter();
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [wordPacks, setWordPacks] = useState<any[]>([]);
  const [selectedWordPack, setSelectedWordPack] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWordPacks = async () => {
      try {
        const response = await fetch('/api/wordpacks');
        const data = await response.json();
        setWordPacks(data);
        setSelectedWordPack(data[0]); // Default to first pack
      } catch (error) {
        console.error('Failed to fetch word packs:', error);
      }
    };
    fetchWordPacks();
  }, []);

  const handleCreateRoom = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/game/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ maxPlayers })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error);
        return;
      }

      if (data.room_code) {
        router.push(`/game/${data.room_code}`);
      }
    } catch (err) {
      setError('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
              <PlusIcon className="h-6 w-6 text-cyan-500" />
              Create New Game
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Player Count */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Maximum Players
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[4, 6, 8, 10].map((count) => (
                  <button
                    key={count}
                    onClick={() => setMaxPlayers(count)}
                    className={`p-3 border rounded-lg text-center transition-all ${
                      maxPlayers === count
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="font-bold text-lg">{count}</div>
                    <div className="text-xs text-gray-500">players</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Word Pack Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                Word Pack
              </label>
              <div className="space-y-3">
                {wordPacks.map((pack) => (
                  <div
                    key={pack.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedWordPack?.id === pack.id
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
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
                            {pack.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {pack.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {pack.content.pairs?.length || 0} word pairs
                          </Badge>
                        </div>
                      </div>
                      {selectedWordPack?.id === pack.id && (
                        <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Rules Preview */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Game Setup</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Players:</span>
                  <span className="font-medium">3-{maxPlayers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Undercover agents:</span>
                  <span className="font-medium">~{Math.max(1, Math.floor(maxPlayers / 4))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Word pack:</span>
                  <span className="font-medium">{selectedWordPack?.title}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCreateRoom}
              disabled={loading || !selectedWordPack}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-lg"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                <>
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Create Room
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Already have a room code?{' '}
                <button
                  onClick={() => router.push('/game/join')}
                  className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium"
                >
                  Join existing game
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}