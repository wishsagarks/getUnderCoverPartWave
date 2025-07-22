import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerComponentClient();

    const { data: wordPacks, error } = await supabase
      .from('word_packs')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(wordPacks);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch word packs' },
      { status: 500 }
    );
  }
}