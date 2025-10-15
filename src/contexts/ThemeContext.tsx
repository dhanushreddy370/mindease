import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { companionConfig } from '../../supabase/functions/_shared/companionConfig';

interface ThemeContextType {
  persona: string | null;
  setPersona: (persona: string) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Convert hex to HSL
function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 50%';

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persona, setPersonaState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPersona = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('user_preferences')
          .select('tone')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (data?.tone) {
          setPersonaState(data.tone);
          applyTheme(data.tone);
        }
      }
      setIsLoading(false);
    };

    fetchPersona();
  }, []);

  const applyTheme = (personaKey: string) => {
    const theme = (companionConfig.personas as any)[personaKey]?.theme;
    if (!theme) return;

    const root = document.documentElement;
    
    // Convert and apply theme colors
    root.style.setProperty('--primary', hexToHSL(theme.primary));
    root.style.setProperty('--secondary', hexToHSL(theme.secondary));
    root.style.setProperty('--accent', hexToHSL(theme.accent));
    root.style.setProperty('--background', hexToHSL(theme.background));
    
    // Adjust foreground colors based on background lightness
    const bgLightness = parseInt(hexToHSL(theme.background).split('%')[1]);
    root.style.setProperty('--foreground', bgLightness > 50 ? '210 16% 24%' : '210 20% 98%');
  };

  const setPersona = (newPersona: string) => {
    setPersonaState(newPersona);
    applyTheme(newPersona);
  };

  return (
    <ThemeContext.Provider value={{ persona, setPersona, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
