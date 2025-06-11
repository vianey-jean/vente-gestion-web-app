
import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/contexts/LanguageContext';

export const ThemeToggle: React.FC = () => {
  const { setTheme, theme } = useTheme();
  const { t } = useLanguage();

  const themes = [
    { value: 'light', icon: Sun, label: t('theme.light') },
    { value: 'dark', icon: Moon, label: t('theme.dark') },
    { value: 'system', icon: Monitor, label: 'Système' },
  ];

  const currentTheme = themes.find(t => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 px-2 hover:bg-accent/50 transition-colors duration-200"
          aria-label="Changer le thème"
        >
          <CurrentIcon className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`flex items-center gap-3 cursor-pointer transition-colors duration-200 ${
                theme === themeOption.value ? 'bg-accent' : ''
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{themeOption.label}</span>
              {theme === themeOption.value && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
