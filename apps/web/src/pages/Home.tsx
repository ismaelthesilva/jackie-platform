import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowRight, Dumbbell, Heart, Users, Award, Globe, FlaskConical, Apple, TrendingUp, Star, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Home: React.FC = () => {
  const { t, language } = useLanguage();

  // Map language to region - this connects navbar language to content region
  const selectedRegion = language === 'br' ? 'brazil' : 'newzealand';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 pt-8 pb-16 md:pt-12 md:pb-24 lg:pt-16 lg:pb-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container relative mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            {selectedRegion === 'brazil' ? (
              // Brazil Hero Content
              <div className="w-full max-w-5xl mx-auto">
                <Badge variant="secondary" className="mb-6 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  🩺 {t('home.hero.brazil.badge')}
                </Badge>
                <div className="space-y-6">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-green-600 via-emerald-600 to-green-800 bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-black dark:via-gray-900 dark:to-gray-800 dark:text-transparent">
                    {t('home.hero.name')}
                  </h1>
                  <h2 className="text-2xl font-semibold text-green-700 dark:text-black mb-6">
                    {t('home.hero.brazil.title')}
                  </h2>
                  <p className="mx-auto max-w-[700px] text-muted-foreground dark:text-gray-800 text-lg md:text-xl leading-relaxed">
                    {t('home.hero.brazil.description')}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-6 rounded-xl border border-green-200 dark:border-green-800 max-w-2xl mx-auto my-8">
                  <h3 className="font-bold text-green-800 dark:text-green-200 mb-3">
                    ⚠️ {t('home.hero.brazil.attention.title')}
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">
                    {t('home.hero.brazil.attention.description')}
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center mt-8">
                  <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                    {t('home.hero.brazil.buttons.primary')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg" className="shadow-lg border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400">
                    {t('home.hero.brazil.buttons.secondary')}
                  </Button>
                </div>
              </div>
            ) : (
              // New Zealand Hero Content
              <div className="w-full max-w-5xl mx-auto">
                <Badge variant="secondary" className="mb-6 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  💪 {t('home.hero.newzealand.badge')}
                </Badge>
                <div className="space-y-6">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-green-600 via-emerald-600 to-green-800 bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-black dark:via-gray-900 dark:to-gray-800 dark:text-transparent">
                    {t('home.hero.name')}
                  </h1>
                  <h2 className="text-2xl font-semibold text-green-700 dark:text-black mb-6">
                    {t('home.hero.newzealand.title')}
                  </h2>
                  <p className="mx-auto max-w-[700px] text-muted-foreground dark:text-gray-800 text-lg md:text-xl leading-relaxed">
                    {t('home.hero.newzealand.description')}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-6 rounded-xl border border-green-200 dark:border-green-800 max-w-2xl mx-auto my-8">
                  <h3 className="font-bold text-green-800 dark:text-green-200 mb-3">
                    🎯 {t('home.hero.newzealand.attention.title')}
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">
                    {t('home.hero.newzealand.attention.description')}
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center mt-8">
                  <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                    {t('home.hero.newzealand.buttons.primary')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg" className="shadow-lg border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400">
                    {t('home.hero.newzealand.buttons.secondary')}
                  </Button>
                </div>
              </div>
            )}
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
      <section className="py-16 md:py-20 lg:py-24 bg-background">
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
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-semibold">MC</span>
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
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-semibold">RS</span>
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
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-semibold">AL</span>
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
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-semibold">SJ</span>
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
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-semibold">MT</span>
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
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-semibold">EP</span>
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
      <section className="py-16 md:py-20 lg:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-4 max-w-5xl mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <Users className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-green-700">
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
                <h3 className="text-4xl font-bold text-green-700">{t('home.stats.experience.number')}</h3>
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
                <h3 className="text-4xl font-bold text-green-700">{t('home.stats.success.number')}</h3>
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
                <h3 className="text-4xl font-bold text-green-700">{t('home.stats.countries.number')}</h3>
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
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                {t(`home.cta.${selectedRegion}.buttons.primary`)}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                {t(`home.cta.${selectedRegion}.buttons.secondary`)}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;