import { NextRequest, NextResponse } from 'next/server';
import { getWordPacks } from '@/lib/database';

export async function GET() {
  try {
    const wordPacks = getWordPacks();
    return NextResponse.json(wordPacks);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch word packs' },
      { status: 500 }
    );
  }
}