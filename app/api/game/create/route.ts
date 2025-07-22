import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { maxPlayers } = await request.json();

    // Generate room code using the database function
    const { data: roomCodeData, error: roomCodeError } = await supabase
      .rpc('generate_room_code');

    if (roomCodeError) {
      return NextResponse.json(
        { error: 'Failed to generate room code' },
        { status: 500 }
      );
    }

    // Create room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        room_code: roomCodeData,
        host_id: user.id,
        max_players: maxPlayers || 8
      })
      .select()
      .single();

    if (roomError) {
      return NextResponse.json(
        { error: roomError.message },
        { status: 500 }
      );
    }

    // Get user profile for username
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    // Add host as first player
    const { error: playerError } = await supabase
      .from('players')
      .insert({
        room_id: room.id,
        user_id: user.id,
        username: profile?.username || user.email!.split('@')[0]
      });

    if (playerError) {
      return NextResponse.json(
        { error: playerError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(room);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create room' },
      { status: 500 }
    );
  }
}