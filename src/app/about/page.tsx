"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import enTranslations from "@/locales/en.json";
import brTranslations from "@/locales/br.json";
import {
  Award,
  Users,
  TrendingUp,
  Heart,
  Target,
  CheckCircle2,
  Star,
  Sparkles,
  Dumbbell,
  Apple,
} from "lucide-react";

const AboutPage: React.FC = () => {
  const { language } = useLanguage();
  const translations = language === "br" ? brTranslations : enTranslations;
  const about = translations.about;
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                {about.hero.badge}
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                {about.hero.title}
              </h1>

              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-medium">
                {about.hero.subtitle}
              </p>

              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                {about.hero.description}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/diet">
                  <Button size="lg" className="group">
                    <Apple className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                    {about.hero.nutritionButton}
                  </Button>
                </Link>
                <Link href="/techniques">
                  <Button size="lg" variant="outline" className="group">
                    <Dumbbell className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                    {about.hero.fitnessButton}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Users className="w-10 h-10 mx-auto mb-3 text-purple-600" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {about.hero.stats.clients}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {about.hero.stats.clientsLabel}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Award className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {about.hero.stats.experience}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {about.hero.stats.experienceLabel}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-10 h-10 mx-auto mb-3 text-green-600" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {about.hero.stats.success}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {about.hero.stats.successLabel}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Star className="w-10 h-10 mx-auto mb-3 text-yellow-600" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {about.hero.stats.rating}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {about.hero.stats.ratingLabel}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Dr. Jackie */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4">{about.whyChoose.badge}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {about.whyChoose.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {about.whyChoose.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-purple-300 transition-all hover:shadow-xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {about.whyChoose.personalized.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {about.whyChoose.personalized.description}
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-blue-300 transition-all hover:shadow-xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {about.whyChoose.evidenceBased.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {about.whyChoose.evidenceBased.description}
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-green-300 transition-all hover:shadow-xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {about.whyChoose.holistic.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {about.whyChoose.holistic.description}
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-2 hover:border-orange-300 transition-all hover:shadow-xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-orange-600 dark:text-orange-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {about.whyChoose.support.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {about.whyChoose.support.description}
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-2 hover:border-pink-300 transition-all hover:shadow-xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-pink-600 dark:text-pink-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {about.whyChoose.results.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {about.whyChoose.results.description}
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-2 hover:border-indigo-300 transition-all hover:shadow-xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {about.whyChoose.trackRecord.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {about.whyChoose.trackRecord.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                {about.credentials.badge}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {about.credentials.title}
              </h2>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      {about.credentials.pharmd.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {about.credentials.pharmd.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      {about.credentials.cissn.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {about.credentials.cissn.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      {about.credentials.nasm.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {about.credentials.nasm.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      {about.credentials.experience.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {about.credentials.experience.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4">{about.philosophy.badge}</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {about.philosophy.title}
              </h2>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
                <CardContent className="p-8 md:p-12">
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    &quot;{about.philosophy.p1}
                  </p>

                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    {about.philosophy.p2}
                  </p>

                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    {about.philosophy.p3}
                  </p>

                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
                    {about.philosophy.p4}&quot;
                  </p>

                  <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {about.philosophy.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {about.philosophy.credentials}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-900 dark:to-blue-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {about.cta.title}
            </h2>
            <p className="text-xl text-purple-100 mb-8">{about.cta.subtitle}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/diet">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  <Apple className="w-4 h-4 mr-2" />
                  {about.cta.nutritionButton}
                </Button>
              </Link>
              <Link href="/techniques">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-white hover:bg-gray-100 text-purple-600 border-0"
                >
                  <Dumbbell className="w-4 h-4 mr-2" />
                  {about.cta.fitnessButton}
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-purple-400">
              <p className="text-purple-100 mb-4">{about.cta.questionText}</p>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  {about.cta.contactButton}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
