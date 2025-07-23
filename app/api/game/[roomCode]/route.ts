import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRoomByCode, getPlayersInRoom, getVotesInRoom } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { roomCode: string } }
) {
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

    const room = getRoomByCode(params.roomCode);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const players = getPlayersInRoom(room.id);
    const votes = getVotesInRoom(room.id, room.current_round);

    return NextResponse.json({ room, players, votes });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch game data' },
      { status: 500 }
    );
  }
}