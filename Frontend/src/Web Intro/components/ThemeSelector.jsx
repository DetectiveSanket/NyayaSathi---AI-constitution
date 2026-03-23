import React, { useState } from 'react';
import { Palette, ChevronDown } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const ThemeSelector = () => {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = themes.find(t => t.id === theme);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ip-theme-btn flex items-center gap-2 px-4 py-2 ip-bg-surface-secondary ip-border-full rounded-lg ip-text-primary transition-all duration-300 transform hover:scale-105"
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">{currentTheme?.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 ip-bg-surface-primary ip-border-full rounded-lg shadow-xl z-50 min-w-[160px] overflow-hidden">
          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => {
                setTheme(themeOption.id);
                setIsOpen(false);
              }}
              className={`ip-theme-option w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200 ${
                theme === themeOption.id ? 'ip-bg-surface-secondary ip-text-accent' : 'ip-text-primary'
              }`}
            >
              <span className="text-lg">{themeOption.icon}</span>
              <span className="font-medium">{themeOption.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;