"use client";

import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGame } from '@/hooks/useGame';
import { GameLobby } from '@/components/game/game-lobby';
import { GameRoom } from '@/components/game/game-room';
import { motion } from 'framer-motion';

export default function RoomPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const roomCode = params.roomCode as string;
  const { room, loading: gameLoading } = useGame(roomCode);

  if (authLoading || gameLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading game...
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please wait while we connect you to the room
          </p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to continue
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You need to be signed in to join a game room.
          </p>
          <a
            href="/signin"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Show appropriate component based on game status
  if (room?.status === 'playing') {
    return <GameRoom roomCode={roomCode} />;
  }

  return <GameLobby roomCode={roomCode} />;
}