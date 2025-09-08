import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  Instagram, 
  Facebook, 
  Twitter,
  Linkedin,
  Globe,
  Heart,
  ExternalLink
} from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Fitness Coaching", href: "/fitness-coaching" },
    { name: "Nutrition Guidance", href: "/nutrition-coaching" },
    { name: "Online Coaching", href: "/online-coaching" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const locations = [
    { country: "Brazil", city: "São Paulo", flag: "🇧🇷" },
    { country: "USA", city: "New York", flag: "🇺🇸" },
    { country: "New Zealand", city: "Auckland", flag: "🇳🇿" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-muted/30 dark:bg-muted/50 border-t">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-4">
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Dr. Jackie
                </span>
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Professional fitness coaching and personalized nutrition guidance to help you achieve 
                sustainable health transformations. Serving clients across Brazil, USA, and New Zealand 
                with evidence-based wellness solutions.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <Heart className="h-3 w-3 mr-1" />
                  500+ Happy Clients
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  <Globe className="h-3 w-3 mr-1" />
                  3 Countries
                </Badge>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 text-emerald-600" />
                <a href="mailto:contact@drjackie.com" className="hover:text-foreground transition-colors">
                  contact@drjackie.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4 text-emerald-600" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Globe className="h-4 w-4 text-emerald-600" />
                <span>Available Worldwide - Online Coaching</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6 text-foreground">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations & Social */}
          <div>
            <h4 className="font-semibold mb-6 text-foreground">Our Locations</h4>
            <div className="space-y-4 mb-6">
              {locations.map((location, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xl">{location.flag}</span>
                  <div>
                    <div className="font-medium text-foreground">{location.country}</div>
                    <div className="text-sm text-muted-foreground">{location.city}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <h5 className="font-medium mb-4 text-foreground">Follow Us</h5>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-10 h-10 p-0 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-900/20"
                    >
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                      >
                        <IconComponent className="h-4 w-4" />
                      </a>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom Bar */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Dr. Jackie. All rights reserved. Made with{" "}
            <Heart className="h-4 w-4 inline text-red-500" /> for your health journey.
          </div>
          
          <div className="flex flex-wrap gap-6 text-sm">
            <Link 
              to="/privacy-policy" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms-of-service" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              to="/cookie-policy" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookie Policy
            </Link>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Sitemap
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
