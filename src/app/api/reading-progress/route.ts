import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fanficId = searchParams.get('fanfic_id');

  if (!fanficId) {
    return NextResponse.json({ error: 'fanfic_id obrigatório' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('fanfic_id', fanficId)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? {
    fanfic_id: fanficId,
    current_chapter: 0,
    scroll_position: 0,
    progress_percent: 0,
  });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const body = await request.json();

  if (!body.fanfic_id) {
    return NextResponse.json({ error: 'fanfic_id obrigatório' }, { status: 400 });
  }

  const progress_percent = Math.min(100, Math.max(0, Math.round(body.progress_percent ?? 0)));

  const { data, error } = await supabase
    .from('reading_progress')
    .upsert({
      user_id: user.id,
      fanfic_id: body.fanfic_id,
      current_chapter: body.current_chapter ?? 0,
      scroll_position: body.scroll_position ?? 0,
      progress_percent,
      last_read_at: new Date().toISOString(),
    }, { onConflict: 'user_id,fanfic_id' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
