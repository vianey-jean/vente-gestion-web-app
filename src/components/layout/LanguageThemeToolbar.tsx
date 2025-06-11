
import React from 'react';
import { LanguageSelector } from '@/components/ui/language-selector';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { PerformanceOptimizer } from '@/components/optimization/PerformanceOptimizer';

export const LanguageThemeToolbar: React.FC = () => {
  return (
    <PerformanceOptimizer cacheKey="language-theme-toolbar">
      <div className="flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>
    </PerformanceOptimizer>
  );
};
