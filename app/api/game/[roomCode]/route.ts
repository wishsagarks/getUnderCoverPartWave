import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { roomCode: string } }
) {
  try {
    const supabase = createServerComponentClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get room data
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', params.roomCode)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Get players data
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id)
      .order('joined_at');

    if (playersError) {
      return NextResponse.json(
        { error: playersError.message },
        { status: 500 }
      );
    }

    // Get votes data
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .eq('room_id', room.id)
      .eq('round', room.current_round);

    if (votesError) {
      return NextResponse.json(
        { error: votesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ room, players, votes });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch game data' },
      { status: 500 }
    );
  }
}