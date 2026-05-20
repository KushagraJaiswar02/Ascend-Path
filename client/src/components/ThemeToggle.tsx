import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-xs border border-border p-xs rounded-lg bg-card text-card-foreground shadow-subtle">
      <button
        onClick={() => setTheme('light')}
        className={`p-sm rounded-md transition-all ${
          theme === 'light'
            ? 'bg-primary text-primary-foreground shadow-subtle'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Light Mode"
        aria-label="Light Mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-sm rounded-md transition-all ${
          theme === 'dark'
            ? 'bg-primary text-primary-foreground shadow-subtle'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Dark Mode"
        aria-label="Dark Mode"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-sm rounded-md transition-all ${
          theme === 'system'
            ? 'bg-primary text-primary-foreground shadow-subtle'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="System Preference"
        aria-label="System Preference"
      >
        <Laptop className="h-4 w-4" />
      </button>
    </div>
  );
}
