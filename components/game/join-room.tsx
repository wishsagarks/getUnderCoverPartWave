"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/aceternity/card';
import { Button } from '@/components/aceternity/button';
import { getAuthToken } from '@/lib/client-auth-helpers';
import { useAuth } from '@/hooks/useAuth';
import { UserPlusIcon, HashIcon } from 'lucide-react';

export function JoinRoom() {
  const { user } = useAuth();
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !roomCode.trim() || !username.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/game/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          roomCode: roomCode.trim().toUpperCase(),
          username: username.trim()
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error);
        return;
      }

      if (data.room) {
        router.push(`/game/${roomCode.trim().toUpperCase()}`);
      }
    } catch (err) {
      setError('Failed to join room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
              <UserPlusIcon className="h-6 w-6 text-cyan-500" />
              Join Game Room
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleJoinRoom} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="roomCode" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Room Code
                </label>
                <div className="relative">
                  <HashIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="roomCode"
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full h-12 pl-10 pr-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-center text-lg font-mono tracking-wider"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Your Display Name
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !roomCode.trim() || !username.trim()}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Joining...</span>
                  </div>
                ) : (
                  <>
                    <UserPlusIcon className="h-5 w-5 mr-2" />
                    Join Room
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Don't have a room code?{' '}
                <button
                  onClick={() => router.push('/game/create')}
                  className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium"
                >
                  Create a new game
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}