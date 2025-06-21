import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { 
  Menu, 
  Sun, 
  Moon, 
  Dumbbell, 
  Apple, 
  Globe, 
  Users, 
  Calendar,
  MessageCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface NavItem {
  title: string;
  href: string;
  description?: string;
  icon?: React.ReactNode;
}

const DarkModeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-700" />
      )}
    </Button>
  );
};

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === 'en' ? 'br' : 'en')}
      className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <span className="text-sm font-medium">
        {language === 'en' ? '🇳🇿 EN' : '🇧🇷 BR'}
      </span>
    </Button>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
  }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {icon}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  // Dynamic services array using translations
  const services: NavItem[] = [
    {
      title: t('navbar.servicesMenu.fitnessCoaching'),
      href: "/fitness-coaching",
      description: t('navbar.servicesMenu.fitnessDescription'),
      icon: <Dumbbell className="h-4 w-4" />,
    },
    {
      title: t('navbar.servicesMenu.nutritionGuidance'),
      href: "/nutrition-coaching", 
      description: t('navbar.servicesMenu.nutritionDescription'),
      icon: <Apple className="h-4 w-4" />,
    },
    {
      title: t('navbar.servicesMenu.onlineCoaching'),
      href: "/online-coaching",
      description: t('navbar.servicesMenu.onlineDescription'),
      icon: <Globe className="h-4 w-4" />,
    },
  ];

  // Dynamic locations array using translations
  const locations: NavItem[] = [
    {
      title: t('navbar.locationsMenu.brazilCoaching'),
      href: "/nzcoachonline",
      description: t('navbar.locationsMenu.brazilDescription'),
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: t('navbar.locationsMenu.usaCoaching'), 
      href: "/ptnz",
      description: t('navbar.locationsMenu.usaDescription'),
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: t('navbar.locationsMenu.newZealand'),
      href: "/online-coaching",
      description: t('navbar.locationsMenu.newZealandDescription'),
      icon: <Users className="h-4 w-4" />,
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Centered Container - matching main content width */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section - Aligned with main content */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center">
                  <img
                    src="/jackie-favicon.png"
                    alt="Dr. Jackie Logo"
                    className="h-10 w-10 object-cover rounded-full"
                  />
                </div>
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 text-xs px-1 py-0 h-4 bg-emerald-100 text-emerald-700 border-emerald-200"
                >
                  MD
                </Badge>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Dr. Jackie
                </span>
                <p className="text-xs text-muted-foreground font-medium">Health & Fitness Coach</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-8">
            <NavigationMenu>
              <NavigationMenuList className="space-x-2">
                <NavigationMenuItem>
                  <Link to="/">
                    <NavigationMenuLink className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      isActive("/") && "bg-accent text-accent-foreground"
                    )}>
                      {t('navbar.home')}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    {t('navbar.services')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <ul className="grid w-[500px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {services.map((service) => (
                        <ListItem
                          key={service.title}
                          title={service.title}
                          href={service.href}
                          icon={service.icon}
                        >
                          {service.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    {t('navbar.locations')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="!bg-white dark:!bg-gray-900 !border !border-gray-200 dark:!border-gray-700 shadow-lg">
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-1 lg:w-[600px]">
                      {locations.map((location) => (
                        <ListItem
                          key={location.title}
                          title={location.title}
                          href={location.href}
                          icon={location.icon}
                        >
                          {location.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/about">
                    <NavigationMenuLink className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      isActive("/about") && "bg-accent text-accent-foreground"
                    )}>
                      {t('navbar.about')}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/contact">
                    <NavigationMenuLink className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      isActive("/contact") && "bg-accent text-accent-foreground"
                    )}>
                      {t('navbar.contact')}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            <DarkModeToggle />
            
            <Button asChild variant="default" size="sm" className="hidden md:flex bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
              <Link to="/get-started" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('navbar.bookSession')}
              </Link>
            </Button>

            {/* Mobile menu trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-6">
                  {/* Mobile Logo */}
                  <Link to="/" className="flex items-center space-x-3 mb-4" onClick={() => setIsOpen(false)}>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">DJ</span>
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Dr. Jackie</span>
                  </Link>

                  <Separator />

                  {/* Mobile Navigation */}
                  <div className="space-y-2">
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link to="/">{t('navbar.home')}</Link>
                    </Button>
                  </div>

                  <Separator />

                  {/* Services */}
                  <div>
                    <h4 className="font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wide">{t('navbar.mobile.services')}</h4>
                    <div className="space-y-2">
                      {services.map((service) => (
                        <Button
                          key={service.title}
                          asChild
                          variant="ghost"
                          className="w-full justify-start h-auto py-3"
                          onClick={() => setIsOpen(false)}
                        >
                          <Link to={service.href} className="flex items-start space-x-3">
                            <div className="mt-0.5">{service.icon}</div>
                            <div className="text-left">
                              <div className="font-medium">{service.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">{service.description}</div>
                            </div>
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Locations */}
                  <div>
                    <h4 className="font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wide">{t('navbar.mobile.locations')}</h4>
                    <div className="space-y-2">
                      {locations.map((location) => (
                        <Button
                          key={location.title}
                          asChild
                          variant="ghost"
                          className="w-full justify-start h-auto py-3"
                          onClick={() => setIsOpen(false)}
                        >
                          <Link to={location.href} className="flex items-start space-x-3">
                            <div className="mt-0.5">{location.icon}</div>
                            <div className="text-left">
                              <div className="font-medium">{location.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">{location.description}</div>
                            </div>
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Other Links */}
                  <div className="space-y-2">
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link to="/about">About Dr. Jackie</Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link to="/contact" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Contact & Support
                      </Link>
                    </Button>
                  </div>

                  <Separator />

                  {/* CTA Button */}
                  <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
                    <Link to="/get-started" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Book Your Session
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;