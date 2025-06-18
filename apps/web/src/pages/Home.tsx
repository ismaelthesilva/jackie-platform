import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowRight, Stethoscope, Dumbbell, Heart, Users, Award, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Home: React.FC = () => {
  const { language } = useLanguage();

  const getText = (en: string, pt: string) => {
    return language === 'en' ? en : pt;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-12 md:py-24 lg:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container relative px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <Badge variant="secondary" className="mb-4">
              🇧🇷 {getText('Doctor in Brazil', 'Médica no Brasil')} • 🇳🇿 {getText('PT in New Zealand', 'Personal Trainer na Nova Zelândia')}
            </Badge>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Dr. Jackie Souto
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl">
                {getText(
                  'Bridging medical expertise from Brazil with fitness coaching from New Zealand. Your comprehensive health and wellness journey starts here.',
                  'Unindo expertise médica do Brasil com coaching fitness da Nova Zelândia. Sua jornada completa de saúde e bem-estar começa aqui.'
                )}
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                {getText('Start Your Journey', 'Comece Sua Jornada')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="shadow-lg">
                {getText('Learn More', 'Saiba Mais')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <Badge variant="outline" className="w-fit">
                {getText('About Dr. Jackie', 'Sobre Dra. Jackie')}
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                {getText(
                  'Dual Expertise, One Mission',
                  'Dupla Expertise, Uma Missão'
                )}
              </h2>
              <p className="text-muted-foreground md:text-lg">
                {getText(
                  'As a licensed medical doctor in Brazil and certified personal trainer in New Zealand, I bring a unique perspective to health and fitness. My approach combines evidence-based medicine with practical fitness strategies.',
                  'Como médica licenciada no Brasil e personal trainer certificada na Nova Zelândia, trago uma perspectiva única para saúde e fitness. Minha abordagem combina medicina baseada em evidências com estratégias práticas de fitness.'
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  {getText('Medical Doctor', 'Médica')}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Dumbbell className="h-3 w-3" />
                  {getText('Certified PT', 'PT Certificada')}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {getText('International Experience', 'Experiência Internacional')}
                </Badge>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">
                      {getText('Holistic Health Approach', 'Abordagem Holística da Saúde')}
                    </h3>
                    <p className="text-blue-100">
                      {getText(
                        'Combining medical knowledge with fitness expertise for optimal results.',
                        'Combinando conhecimento médico com expertise em fitness para resultados ideais.'
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold">🇧🇷</div>
                      <div className="text-sm text-blue-100">{getText('Medical Background', 'Formação Médica')}</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold">🇳🇿</div>
                      <div className="text-sm text-blue-100">{getText('Fitness Expertise', 'Expertise em Fitness')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">
                {getText('Services', 'Serviços')}
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                {getText('Comprehensive Health Solutions', 'Soluções Completas de Saúde')}
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {getText(
                  'From medical consultations to personalized fitness programs, get everything you need for optimal health.',
                  'De consultas médicas a programas de fitness personalizados, obtenha tudo que precisa para uma saúde ideal.'
                )}
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <CardTitle className="text-blue-900 dark:text-blue-100">
                  {getText('Medical Consultations', 'Consultas Médicas')}
                </CardTitle>
                <CardDescription>
                  {getText(
                    'Professional medical advice with a focus on preventive care and wellness optimization.',
                    'Aconselhamento médico profissional com foco em cuidados preventivos e otimização do bem-estar.'
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500 text-white">
                  <Dumbbell className="h-6 w-6" />
                </div>
                <CardTitle className="text-purple-900 dark:text-purple-100">
                  {getText('Personal Training', 'Personal Training')}
                </CardTitle>
                <CardDescription>
                  {getText(
                    'Customized fitness programs designed with medical insights for safe and effective results.',
                    'Programas de fitness personalizados desenvolvidos com insights médicos para resultados seguros e eficazes.'
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500 text-white">
                  <Heart className="h-6 w-6" />
                </div>
                <CardTitle className="text-green-900 dark:text-green-100">
                  {getText('Wellness Coaching', 'Coaching de Bem-estar')}
                </CardTitle>
                <CardDescription>
                  {getText(
                    'Holistic approach combining nutrition, lifestyle, and mental health for complete wellness.',
                    'Abordagem holística combinando nutrição, estilo de vida e saúde mental para bem-estar completo.'
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <Users className="h-8 w-8" />
              </div>
              <div className="space-y-1 text-center">
                <h3 className="text-3xl font-bold">1000+</h3>
                <p className="text-muted-foreground">{getText('Clients Helped', 'Clientes Atendidos')}</p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <Award className="h-8 w-8" />
              </div>
              <div className="space-y-1 text-center">
                <h3 className="text-3xl font-bold">10+</h3>
                <p className="text-muted-foreground">{getText('Years Experience', 'Anos de Experiência')}</p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-600 text-white">
                <Globe className="h-8 w-8" />
              </div>
              <div className="space-y-1 text-center">
                <h3 className="text-3xl font-bold">2</h3>
                <p className="text-muted-foreground">{getText('Countries', 'Países')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                {getText('Ready to Transform Your Health?', 'Pronto para Transformar Sua Saúde?')}
              </h2>
              <p className="mx-auto max-w-[600px] text-blue-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {getText(
                  'Join hundreds of clients who have achieved their health goals with our unique medical-fitness approach.',
                  'Junte-se a centenas de clientes que alcançaram seus objetivos de saúde com nossa abordagem única médico-fitness.'
                )}
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                {getText('Book Consultation', 'Agendar Consulta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                {getText('View Programs', 'Ver Programas')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;