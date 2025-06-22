import React from "react";
import { Button } from '@/components/ui/button';
import { Link } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Dumbbell, Heart, Users, Award, Globe, FlaskConical, Apple, TrendingUp, Star, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const Home: React.FC = () => {
  const { t, language } = useLanguage();

  // Map language to region - this connects navbar language to content region
  const selectedRegion = language === 'br' ? 'brazil' : 'newzealand';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Hero Section with Dr. Jackie Professional Overlay */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-gray-900">
        {/* Background Image with Professional Styling */}
        <div className="absolute inset-0">
          <img
            src="/jackie-images/dr-jackie-hero.jpeg"
            alt="Dr. Jackie - Professional Health & Fitness Coach"
            className="w-full h-full object-cover object-center"
          />
          {/* Multi-layer Professional Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-blue-900/20"></div>
        </div>
        
        {/* Content Overlay with Enhanced Design */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Professional Badge */}
            <div className="mb-8 animate-fade-in">
              {selectedRegion === 'brazil' ? (
                <Badge variant="secondary" className="text-emerald-100 bg-emerald-500/20 border-emerald-400/30 px-6 py-2 text-sm backdrop-blur-sm shadow-lg">
                  <Star className="h-4 w-4 mr-2" />
                  🩺 {t('home.hero.brazil.badge')}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-emerald-100 bg-emerald-500/20 border-emerald-400/30 px-6 py-2 text-sm backdrop-blur-sm shadow-lg">
                  <Star className="h-4 w-4 mr-2" />
                  💪 {t('home.hero.newzealand.badge')}
                </Badge>
              )}
            </div>
            
            {/* Main Heading with Animation */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-center animate-slide-in-up">
              <span className="text-white block mb-4">{t('home.hero.transformText')}</span>
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {t('home.hero.name')}
              </span>
            </h1>
            
            {/* Dynamic Subtitle Based on Region */}
            <div className="mb-12 animate-slide-in-up" style={{animationDelay: '0.2s'}}>
              {selectedRegion === 'brazil' ? (
                <>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl mb-6 text-emerald-400 leading-relaxed text-center font-semibold">
                    {t('home.hero.brazil.title')}
                  </h2>
                  <p className="text-xl md:text-2xl text-gray-200 leading-relaxed text-center max-w-4xl mx-auto font-light">
                    {t('home.hero.brazil.description')}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl mb-6 text-emerald-400 leading-relaxed text-center font-semibold">
                    {t('home.hero.newzealand.title')}
                  </h2>
                  <p className="text-xl md:text-2xl text-gray-200 leading-relaxed text-center max-w-4xl mx-auto font-light">
                    {t('home.hero.newzealand.description')}
                  </p>
                </>
              )}
            </div>
            
            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-in-up" style={{animationDelay: '0.4s'}}>
              {selectedRegion === 'brazil' ? (
                <>
                  <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <Link to="/contact" className="flex items-center gap-2 px-8 py-4">
                      <Dumbbell className="h-5 w-5" />
                      {t('home.hero.brazil.buttons.primary')}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm shadow-2xl px-8 py-4">
                    <Link to="/nzcoachonline" className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      {t('home.hero.brazil.buttons.secondary')}
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <Link to="/contact" className="flex items-center gap-2 px-8 py-4">
                      <Dumbbell className="h-5 w-5" />
                      {t('home.hero.newzealand.buttons.primary')}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                    <Link to="/nzcoachonline" className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      {t(`home.hero.newzealand.buttons.secondary`)}
                    </Link>
                  </Button>
                </>
              )}
            </div>
            
            {/* Professional Stats with Icons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-12 animate-slide-in-up" style={{animationDelay: '0.6s'}}>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-emerald-400">
                  {selectedRegion === 'brazil' ? t('home.stats.brazil.clients.number') : t('home.stats.newzealand.clients.number')}
                </div>
                <div className="text-sm text-gray-300">
                  {selectedRegion === 'brazil' ? t('home.stats.brazil.clients.label') : t('home.stats.newzealand.clients.label')}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Globe className="h-6 w-6 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-400">3</div>
                <div className="text-sm text-gray-300">
                  {selectedRegion === 'brazil' ? t('home.stats.brazil.countries.label') : t('home.stats.newzealand.countries.label')}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-6 w-6 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-purple-400">{t('home.stats.experience.number')}</div>
                <div className="text-sm text-gray-300">
                  {selectedRegion === 'brazil' ? t('home.stats.brazil.experience.label') : t('home.stats.newzealand.experience.label')}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-400">98%</div>
                <div className="text-sm text-gray-300">
                  {selectedRegion === 'brazil' ? t('home.stats.brazil.success.label') : t('home.stats.newzealand.success.label')}
                </div>
              </div>
            </div>
            
            {/* Important Notice with Glass Effect */}
            <div className="mt-8 animate-slide-in-up" style={{animationDelay: '0.8s'}}>
              {selectedRegion === 'brazil' ? (
                <div className="bg-emerald-500/20 backdrop-blur-sm p-6 rounded-xl border border-emerald-400/30 max-w-3xl mx-auto shadow-xl">
                  <h3 className="font-bold text-emerald-100 mb-3 flex items-center justify-center gap-2 text-lg">
                    ⚠️ {t('home.hero.brazil.attention.title')}
                  </h3>
                  <p className="text-emerald-200 text-sm leading-relaxed">
                    {t('home.hero.brazil.attention.description')}
                  </p>
                </div>
              ) : (
                <div className="bg-blue-500/20 backdrop-blur-sm p-6 rounded-xl border border-blue-400/30 max-w-3xl mx-auto shadow-xl">
                  <h3 className="font-bold text-blue-100 mb-3 flex items-center justify-center gap-2 text-lg">
                    🎯 {t('home.hero.newzealand.attention.title')}
                  </h3>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    {t('home.hero.newzealand.attention.description')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2 text-gray-200">{t('home.hero.scrollDown', 'Scroll Down')}</span>
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center backdrop-blur-sm">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Problem/Solution Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-red-50 dark:bg-red-950/20">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {selectedRegion === 'brazil' ? (
            // Brazil Problem/Solution
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-red-700 dark:text-red-400">
                {t('home.problem.brazil.title')}
              </h2>
              <div className="grid md:grid-cols-2 gap-8 mt-12">
                <div className="bg-red-100 dark:bg-red-900/30 p-8 rounded-lg">
                  <h3 className="font-bold text-red-800 dark:text-red-300 mb-6 text-xl">❌ {t('home.problem.brazil.problem.title')}</h3>
                  <ul className="text-left space-y-3 text-red-700 dark:text-red-400">
                    <li>• {t('home.problem.brazil.problem.point1')}</li>
                    <li>• {t('home.problem.brazil.problem.point2')}</li>
                    <li>• {t('home.problem.brazil.problem.point3')}</li>
                    <li>• {t('home.problem.brazil.problem.point4')}</li>
                  </ul>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-8 rounded-lg">
                  <h3 className="font-bold text-green-800 dark:text-green-300 mb-6 text-xl">✅ {t('home.problem.brazil.solution.title')}</h3>
                  <ul className="text-left space-y-3 text-green-700 dark:text-green-400">
                    <li>• {t('home.problem.brazil.solution.point1')}</li>
                    <li>• {t('home.problem.brazil.solution.point2')}</li>
                    <li>• {t('home.problem.brazil.solution.point3')}</li>
                    <li>• {t('home.problem.brazil.solution.point4')}</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            // New Zealand Problem/Solution
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-red-700 dark:text-red-400">
                {t('home.problem.newzealand.title')}
              </h2>
              <div className="grid md:grid-cols-2 gap-8 mt-12">
                <div className="bg-red-100 dark:bg-red-900/30 p-8 rounded-lg">
                  <h3 className="font-bold text-red-800 dark:text-red-300 mb-6 text-xl">❌ {t('home.problem.newzealand.problem.title')}</h3>
                  <ul className="text-left space-y-3 text-red-700 dark:text-red-400">
                    <li>• {t('home.problem.newzealand.problem.point1')}</li>
                    <li>• {t('home.problem.newzealand.problem.point2')}</li>
                    <li>• {t('home.problem.newzealand.problem.point3')}</li>
                    <li>• {t('home.problem.newzealand.problem.point4')}</li>
                  </ul>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-8 rounded-lg">
                  <h3 className="font-bold text-green-800 dark:text-green-300 mb-6 text-xl">✅ {t('home.problem.newzealand.solution.title')}</h3>
                  <ul className="text-left space-y-3 text-green-700 dark:text-green-400">
                    <li>• {t('home.problem.newzealand.solution.point1')}</li>
                    <li>• {t('home.problem.newzealand.solution.point2')}</li>
                    <li>• {t('home.problem.newzealand.solution.point3')}</li>
                    <li>• {t('home.problem.newzealand.solution.point4')}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {t(`home.services.${selectedRegion}.badge`)}
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-green-800 dark:text-green-200">
              {t(`home.services.${selectedRegion}.title`)}
            </h2>
          </div>

          {selectedRegion === 'brazil' ? (
            // Brazil Services
            <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
                <CardHeader className="p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500 text-white mb-4">
                    <FlaskConical className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-green-900 dark:text-green-100 text-xl mb-3">
                    {t('home.services.brazil.service1.title')}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed mb-6">
                    {t('home.services.brazil.service1.description')}
                  </CardDescription>
                  <div className="mt-auto">
                    <div className="text-3xl font-bold text-green-600">{t('home.services.brazil.service1.price')}</div>
                    <div className="text-sm text-muted-foreground">{t('home.services.brazil.service1.period')}</div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900">
                <CardHeader className="p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500 text-white mb-4">
                    <Apple className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-emerald-900 dark:text-emerald-100 text-xl mb-3">
                    {t('home.services.brazil.service2.title')}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed mb-6">
                    {t('home.services.brazil.service2.description')}
                  </CardDescription>
                  <div className="mt-auto">
                    <div className="text-3xl font-bold text-emerald-600">{t('home.services.brazil.service2.price')}</div>
                    <div className="text-sm text-muted-foreground">{t('home.services.brazil.service2.period')}</div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-green-100 dark:from-teal-950 dark:to-green-900">
                <CardHeader className="p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500 text-white mb-4">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-teal-900 dark:text-teal-100 text-xl mb-3">
                    {t('home.services.brazil.service3.title')}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed mb-6">
                    {t('home.services.brazil.service3.description')}
                  </CardDescription>
                  <div className="mt-auto">
                    <div className="text-3xl font-bold text-teal-600">{t('home.services.brazil.service3.price')}</div>
                    <div className="text-sm text-muted-foreground">{t('home.services.brazil.service3.period')}</div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          ) : (
            // New Zealand Services
            <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
                <CardHeader className="p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500 text-white mb-4">
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-green-900 dark:text-green-100 text-xl mb-3">
                    {t('home.services.newzealand.service1.title')}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed mb-6">
                    {t('home.services.newzealand.service1.description')}
                  </CardDescription>
                  <div className="mt-auto">
                    <div className="text-3xl font-bold text-green-600">{t('home.services.newzealand.service1.price')}</div>
                    <div className="text-sm text-muted-foreground">{t('home.services.newzealand.service1.period')}</div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900">
                <CardHeader className="p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500 text-white mb-4">
                    <Heart className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-emerald-900 dark:text-emerald-100 text-xl mb-3">
                    {t('home.services.newzealand.service2.title')}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed mb-6">
                    {t('home.services.newzealand.service2.description')}
                  </CardDescription>
                  <div className="mt-auto">
                    <div className="text-3xl font-bold text-emerald-600">{t('home.services.newzealand.service2.price')}</div>
                    <div className="text-sm text-muted-foreground">{t('home.services.newzealand.service2.period')}</div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-green-100 dark:from-teal-950 dark:to-green-900">
                <CardHeader className="p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500 text-white mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-teal-900 dark:text-teal-100 text-xl mb-3">
                    {t('home.services.newzealand.service3.title')}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed mb-6">
                    {t('home.services.newzealand.service3.description')}
                  </CardDescription>
                  <div className="mt-auto">
                    <div className="text-3xl font-bold text-teal-600">{t('home.services.newzealand.service3.price')}</div>
                    <div className="text-sm text-muted-foreground">{t('home.services.newzealand.service3.period')}</div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-green-50 dark:bg-green-950/20">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-green-800 dark:text-green-200 mb-4">
              {t(`home.testimonials.${selectedRegion}.title`)}
            </h2>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
            {selectedRegion === 'brazil' ? (
              // Brazil Testimonials
              <>
                <Card className="bg-white dark:bg-gray-900 shadow-lg">
                  <CardHeader className="p-8">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <CardDescription className="text-base leading-relaxed mb-6">
                      {t('home.testimonials.brazil.testimonial1.quote')}
                    </CardDescription>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-200 font-semibold">MC</span>
                      </div>
                      <div>
                        <div className="font-semibold">{t('home.testimonials.brazil.testimonial1.name')}</div>
                        <div className="text-sm text-muted-foreground">{t('home.testimonials.brazil.testimonial1.location')}</div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="bg-white dark:bg-gray-900 shadow-lg">
                  <CardHeader className="p-8">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <CardDescription className="text-base leading-relaxed mb-6">
                      {t('home.testimonials.brazil.testimonial2.quote')}
                    </CardDescription>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-200 font-semibold">RS</span>
                      </div>
                      <div>
                        <div className="font-semibold">{t('home.testimonials.brazil.testimonial2.name')}</div>
                        <div className="text-sm text-muted-foreground">{t('home.testimonials.brazil.testimonial2.location')}</div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="bg-white dark:bg-gray-900 shadow-lg">
                  <CardHeader className="p-8">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <CardDescription className="text-base leading-relaxed mb-6">
                      {t('home.testimonials.brazil.testimonial3.quote')}
                    </CardDescription>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-200 font-semibold">AL</span>
                      </div>
                      <div>
                        <div className="font-semibold">{t('home.testimonials.brazil.testimonial3.name')}</div>
                        <div className="text-sm text-muted-foreground">{t('home.testimonials.brazil.testimonial3.location')}</div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </>
            ) : (
              // New Zealand Testimonials
              <>
                <Card className="bg-white dark:bg-gray-900 shadow-lg">
                  <CardHeader className="p-8">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <CardDescription className="text-base leading-relaxed mb-6">
                      {t('home.testimonials.newzealand.testimonial1.quote')}
                    </CardDescription>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-200 font-semibold">SJ</span>
                      </div>
                      <div>
                        <div className="font-semibold">{t('home.testimonials.newzealand.testimonial1.name')}</div>
                        <div className="text-sm text-muted-foreground">{t('home.testimonials.newzealand.testimonial1.location')}</div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="bg-white dark:bg-gray-900 shadow-lg">
                  <CardHeader className="p-8">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <CardDescription className="text-base leading-relaxed mb-6">
                      {t('home.testimonials.newzealand.testimonial2.quote')}
                    </CardDescription>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-200 font-semibold">MT</span>
                      </div>
                      <div>
                        <div className="font-semibold">{t('home.testimonials.newzealand.testimonial2.name')}</div>
                        <div className="text-sm text-muted-foreground">{t('home.testimonials.newzealand.testimonial2.location')}</div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="bg-white dark:bg-gray-900 shadow-lg">
                  <CardHeader className="p-8">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <CardDescription className="text-base leading-relaxed mb-6">
                      {t('home.testimonials.newzealand.testimonial3.quote')}
                    </CardDescription>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-200 font-semibold">EP</span>
                      </div>
                      <div>
                        <div className="font-semibold">{t('home.testimonials.newzealand.testimonial3.name')}</div>
                        <div className="text-sm text-muted-foreground">{t('home.testimonials.newzealand.testimonial3.location')}</div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-4 max-w-5xl mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <Users className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-green-700 dark:text-green-300">
                  {t(`home.stats.${selectedRegion}.clients.number`)}
                </h3>
                <p className="text-muted-foreground">
                  {t(`home.stats.${selectedRegion}.clients.label`)}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                <Award className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-green-700 dark:text-green-300">{t('home.stats.experience.number')}</h3>
                <p className="text-muted-foreground">
                  {t(`home.stats.${selectedRegion}.experience.label`)}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-600 text-white">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-green-700 dark:text-green-300">{t('home.stats.success.number')}</h3>
                <p className="text-muted-foreground">
                  {t(`home.stats.${selectedRegion}.success.label`)}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-green-600 text-white">
                <Globe className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-green-700 dark:text-green-300">{t('home.stats.countries.number')}</h3>
                <p className="text-muted-foreground">
                  {t(`home.stats.${selectedRegion}.countries.label`)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-6 max-w-4xl">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                {t(`home.cta.${selectedRegion}.title`)}
              </h2>
              <p className="mx-auto max-w-[600px] text-green-100 text-lg md:text-xl leading-relaxed">
                {t(`home.cta.${selectedRegion}.description`)}
              </p>
            </div>
            
            <div className="bg-green-500 p-8 rounded-xl max-w-md mx-auto">
              <h3 className="font-bold text-white mb-3 text-lg">
                🎁 {t(`home.cta.${selectedRegion}.offer.title`)}
              </h3>
              <p className="text-green-100 text-sm mb-4 leading-relaxed">
                {t(`home.cta.${selectedRegion}.offer.description`)}
              </p>
              <Badge variant="secondary" className="bg-white text-green-600">
                {t(`home.cta.${selectedRegion}.offer.spots`)}
              </Badge>
            </div>

            <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
              {/* Update the final CTA section buttons to link to contact*/}
              <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
                <Button asChild size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                  <Link to="/contact" className="flex items-center gap-2">
                    {t(`home.cta.${selectedRegion}.buttons.primary`)}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <Link to="/contact" className="flex items-center gap-2">
                    {t(`home.cta.${selectedRegion}.buttons.secondary`)}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;