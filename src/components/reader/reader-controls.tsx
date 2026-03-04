'use client';

import {
  Sun,
  Moon,
  BookOpen,
  Columns2,
  Minus,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  FONT_SIZE_LABELS,
  TEXT_WIDTH_LABELS,
  READING_THEME_LABELS,
} from '@/lib/constants';
import type { FontSize, ReadingTheme, TextWidth } from '@/types';

const FONT_SIZES: FontSize[] = ['small', 'medium', 'large', 'extra-large'];
const THEMES: ReadingTheme[] = ['light', 'dark', 'sepia'];
const WIDTHS: TextWidth[] = ['narrow', 'medium', 'wide'];

interface ReaderControlsProps {
  fontSize: FontSize;
  readingTheme: ReadingTheme;
  textWidth: TextWidth;
  progressPercent: number;
  onFontSizeChange: (size: FontSize) => void;
  onThemeChange: (theme: ReadingTheme) => void;
  onWidthChange: (width: TextWidth) => void;
}

export function ReaderControls({
  fontSize,
  readingTheme,
  textWidth,
  progressPercent,
  onFontSizeChange,
  onThemeChange,
  onWidthChange,
}: ReaderControlsProps) {
  const currentIndex = FONT_SIZES.indexOf(fontSize);

  const decreaseFont = () => {
    if (currentIndex > 0) onFontSizeChange(FONT_SIZES[currentIndex - 1]);
  };

  const increaseFont = () => {
    if (currentIndex < FONT_SIZES.length - 1) onFontSizeChange(FONT_SIZES[currentIndex + 1]);
  };

  return (
    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        {/* Font size controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={decreaseFont}
            disabled={currentIndex === 0}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-xs text-muted-foreground w-6 text-center">
            {FONT_SIZE_LABELS[fontSize].charAt(0)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={increaseFont}
            disabled={currentIndex === FONT_SIZES.length - 1}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Theme toggle */}
        <ToggleGroup
          type="single"
          value={readingTheme}
          onValueChange={(v) => v && onThemeChange(v as ReadingTheme)}
          className="gap-0"
        >
          {THEMES.map((theme) => (
            <ToggleGroupItem
              key={theme}
              value={theme}
              className="h-8 w-8 px-0"
              aria-label={READING_THEME_LABELS[theme]}
            >
              {theme === 'light' && <Sun className="h-3.5 w-3.5" />}
              {theme === 'dark' && <Moon className="h-3.5 w-3.5" />}
              {theme === 'sepia' && <BookOpen className="h-3.5 w-3.5" />}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {/* Width toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Columns2 className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Largura do texto</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {WIDTHS.map((w) => (
              <DropdownMenuItem
                key={w}
                onClick={() => onWidthChange(w)}
                className={textWidth === w ? 'bg-accent' : ''}
              >
                {TEXT_WIDTH_LABELS[w]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Progress */}
        <span className="text-xs text-muted-foreground tabular-nums">
          {progressPercent}%
        </span>
      </div>
    </div>
  );
}
