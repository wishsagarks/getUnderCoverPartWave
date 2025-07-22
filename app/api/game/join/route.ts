import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomCode, username } = await request.json();

    // Check if room exists and has space
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select(`
        *,
        players:players(count)
      `)
      .eq('room_code', roomCode)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const playerCount = room.players?.[0]?.count || 0;
    if (playerCount >= room.max_players) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    // Check if user is already in the room
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('room_id', room.id)
      .eq('user_id', user.id)
      .single();

    if (existingPlayer) {
      return NextResponse.json({ error: 'Already in this room' }, { status: 400 });
    }

    // Join the room
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        room_id: room.id,
        user_id: user.id,
        username: username || user.email!.split('@')[0]
      })
      .select()
      .single();

    if (playerError) {
      return NextResponse.json(
        { error: playerError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ room, player });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to join room' },
      { status: 500 }
    );
  }
}