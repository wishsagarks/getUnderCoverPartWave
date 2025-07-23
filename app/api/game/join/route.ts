import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRoomByCode, joinRoom, getPlayersInRoom } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = getCurrentUser(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { roomCode, username } = await request.json();

    const room = getRoomByCode(roomCode);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const players = getPlayersInRoom(room.id);
    if (players.length >= room.max_players) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    // Check if user is already in the room
    const existingPlayer = players.find(p => p.user_id === user.id);
    if (existingPlayer) {
      return NextResponse.json({ error: 'Already in this room' }, { status: 400 });
    }

    const player = joinRoom(room.id, user.id, username || user.username);

    return NextResponse.json({ room, player });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to join room' },
      { status: 500 }
    );
  }
}