import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VALID_FONT_SIZES = ['small', 'medium', 'large', 'extra-large'];
const VALID_THEMES = ['light', 'dark', 'sepia'];
const VALID_MODES = ['scroll', 'paginated'];
const VALID_WIDTHS = ['narrow', 'medium', 'wide'];

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return defaults if no preferences exist yet
  return NextResponse.json(data ?? {
    user_id: user.id,
    font_size: 'medium',
    reading_theme: 'dark',
    reading_mode: 'scroll',
    text_width: 'medium',
  });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, string> = {};

  if (body.font_size && VALID_FONT_SIZES.includes(body.font_size)) {
    updates.font_size = body.font_size;
  }
  if (body.reading_theme && VALID_THEMES.includes(body.reading_theme)) {
    updates.reading_theme = body.reading_theme;
  }
  if (body.reading_mode && VALID_MODES.includes(body.reading_mode)) {
    updates.reading_mode = body.reading_mode;
  }
  if (body.text_width && VALID_WIDTHS.includes(body.text_width)) {
    updates.text_width = body.text_width;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo válido' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
