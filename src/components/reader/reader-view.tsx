'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ReaderControls } from '@/components/reader/reader-controls';
import { usePreferences } from '@/hooks/use-preferences';
import { useReadingProgress } from '@/hooks/use-reading-progress';
import { FONT_SIZE_MAP, TEXT_WIDTH_MAP } from '@/lib/constants';
import { STATUS_LABELS } from '@/lib/constants';
import type { Fanfic, FanficContent } from '@/types';

const THEME_STYLES = {
  light: 'bg-white text-gray-900',
  dark: '',
  sepia: 'bg-amber-50 text-amber-950',
} as const;

const PROSE_THEME = {
  light: 'prose-neutral',
  dark: 'prose-neutral dark:prose-invert',
  sepia: 'prose-amber',
} as const;

interface ReaderViewProps {
  fanfic: Fanfic;
}

export function ReaderView({ fanfic }: ReaderViewProps) {
  const canLoad = fanfic.status === 'completed' && !!fanfic.content_path;
  const [content, setContent] = useState<FanficContent | null>(null);
  const [loading, setLoading] = useState(canLoad);
  const articleRef = useRef<HTMLDivElement>(null);

  const { preferences, update: updatePreferences } = usePreferences();
  const { progress, save: saveProgress } = useReadingProgress(fanfic.id);

  // Load content
  useEffect(() => {
    if (!canLoad) return;

    let cancelled = false;
    fetch(`/api/fanfics/${fanfic.id}/content`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setContent(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [fanfic.id, canLoad]);

  // Restore scroll position after content loads
  useEffect(() => {
    if (content && progress.scroll_position > 0) {
      requestAnimationFrame(() => {
        window.scrollTo(0, progress.scroll_position);
      });
    }
    // Only on content load, not on every progress change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // Track scroll progress
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

    saveProgress({
      scroll_position: scrollTop,
      progress_percent: percent,
    });
  }, [saveProgress]);

  useEffect(() => {
    if (!content) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [content, handleScroll]);

  const title = fanfic.title_translated || fanfic.title_original || 'Sem título';
  const widthClass = TEXT_WIDTH_MAP[preferences.text_width];
  const themeClass = THEME_STYLES[preferences.reading_theme];
  const proseTheme = PROSE_THEME[preferences.reading_theme];

  return (
    <div className={themeClass}>
      {/* Header */}
      <div className="mx-auto max-w-3xl space-y-4 px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/library">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight truncate">{title}</h1>
            {fanfic.title_original && fanfic.title_translated && (
              <p className="text-sm text-muted-foreground truncate">
                {fanfic.title_original}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              por {fanfic.author}
              {fanfic.word_count > 0 && (
                <span className="ml-2">
                  · {fanfic.word_count.toLocaleString('pt-BR')} palavras
                </span>
              )}
            </p>
          </div>
          <Badge variant={fanfic.status === 'completed' ? 'secondary' : 'outline'}>
            {STATUS_LABELS[fanfic.status] || fanfic.status}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {fanfic.status === 'completed' && fanfic.epub_path && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/fanfics/${fanfic.id}`} download>
                <Download className="mr-2 h-4 w-4" />
                Download EPUB
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <a href={fanfic.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver no AO3
            </a>
          </Button>
        </div>
      </div>

      {/* Controls bar */}
      {canLoad && (
        <ReaderControls
          fontSize={preferences.font_size}
          readingTheme={preferences.reading_theme}
          textWidth={preferences.text_width}
          progressPercent={progress.progress_percent}
          onFontSizeChange={(size) => updatePreferences({ font_size: size })}
          onThemeChange={(theme) => updatePreferences({ reading_theme: theme })}
          onWidthChange={(width) => updatePreferences({ text_width: width })}
        />
      )}

      {/* Content */}
      <div className={`mx-auto ${widthClass} px-4 py-8`}>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : content ? (
          <article
            ref={articleRef}
            className={`prose ${proseTheme} max-w-none`}
            style={{ fontSize: FONT_SIZE_MAP[preferences.font_size] }}
          >
            {content.chapters.map((chapter, i) => (
              <section key={i}>
                {content.chapters.length > 1 && (
                  <h2>{chapter.title}</h2>
                )}
                <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
              </section>
            ))}
          </article>
        ) : fanfic.status === 'completed' ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">
              Conteúdo não disponível para leitura online.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Faça o download do EPUB para ler esta fanfic.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">
              Esta fanfic ainda está sendo processada.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Status: {STATUS_LABELS[fanfic.status] || fanfic.status}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
