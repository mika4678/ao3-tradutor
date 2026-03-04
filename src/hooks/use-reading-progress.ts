'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface ProgressState {
  current_chapter: number;
  scroll_position: number;
  progress_percent: number;
}

export function useReadingProgress(fanficId: string) {
  const [progress, setProgress] = useState<ProgressState>({
    current_chapter: 0,
    scroll_position: 0,
    progress_percent: 0,
  });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved progress
  useEffect(() => {
    fetch(`/api/reading-progress?fanfic_id=${fanficId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setProgress({
            current_chapter: data.current_chapter ?? 0,
            scroll_position: data.scroll_position ?? 0,
            progress_percent: data.progress_percent ?? 0,
          });
        }
      });
  }, [fanficId]);

  const save = useCallback((update: Partial<ProgressState>) => {
    setProgress((prev) => {
      const next = { ...prev, ...update };

      // Debounce saves to avoid spamming the API
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch('/api/reading-progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fanfic_id: fanficId, ...next }),
        });
      }, 2000);

      return next;
    });
  }, [fanficId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return { progress, save };
}
