import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Navbar: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'br' : 'en';
    setLanguage(newLanguage);
  };

  const getFlag = () => {
    return language === 'en' ? '🇳🇿' : '🇧🇷';
  };

  const getText = (en: string, br: string) => {
    return language === 'en' ? en : br;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <img 
              src="/jackie-favicon.png" 
              alt="Jackie Souto" 
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Jackie Souto
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link 
              to="/" 
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              {getText('Home', 'Início')}
            </Link>
            <Link 
              to="/techniques" 
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {getText('Techniques', 'Técnicas')}
            </Link>
            <Link 
              to="/diet" 
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {getText('Diet', 'Dieta')}
            </Link>
          </nav>
        </div>
        
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Controls */}
          <nav className="flex items-center space-x-1">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="w-9 px-0"
              title={getText('Switch to Portuguese', 'Mudar para Inglês')}
            >
              <span className="text-lg">{getFlag()}</span>
              <span className="sr-only">{getText('Toggle language', 'Alternar idioma')}</span>
            </Button>
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 px-0"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">{getText('Toggle theme', 'Alternar tema')}</span>
            </Button>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur md:hidden">
          <nav className="container py-4">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-foreground hover:text-foreground/80 px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {getText('Home', 'Início')}
              </Link>
              <Link 
                to="/techniques" 
                className="text-foreground/60 hover:text-foreground/80 px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {getText('Techniques', 'Técnicas')}
              </Link>
              <Link 
                to="/diet" 
                className="text-foreground/60 hover:text-foreground/80 px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {getText('Diet', 'Dieta')}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;