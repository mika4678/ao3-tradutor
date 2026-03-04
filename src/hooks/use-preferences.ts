'use client';

import { useEffect, useState, useCallback } from 'react';
import type { UserPreferences } from '@/types';

const DEFAULTS: Omit<UserPreferences, 'id' | 'user_id'> = {
  font_size: 'medium',
  reading_theme: 'dark',
  reading_mode: 'scroll',
  text_width: 'medium',
};

export function usePreferences() {
  const [preferences, setPreferences] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/preferences')
      .then((res) => (res.ok ? res.json() : DEFAULTS))
      .then(setPreferences)
      .finally(() => setLoading(false));
  }, []);

  const update = useCallback(async (patch: Partial<typeof DEFAULTS>) => {
    setPreferences((prev) => ({ ...prev, ...patch }));

    const res = await fetch('/api/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      // Revert on error
      setPreferences((prev) => ({ ...prev }));
    }
  }, []);

  return { preferences, loading, update };
}
