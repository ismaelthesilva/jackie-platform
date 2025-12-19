'use client';

import React, { useState, useEffect } from "react";
import emailjs from '@emailjs/browser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Star, Trophy, Users, Target, Phone, Mail, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export default function PTNZPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    // Inject the Facebook Pixel script
    const script = document.createElement("script");
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '2833351920186067');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Inject the <noscript> image tracking
    const noscript = document.createElement("noscript");
    noscript.innerHTML = `
      <img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=2833351920186067&ev=PageView&noscript=1"
      />
    `;
    document.body.appendChild(noscript);

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        document.head.removeChild(script);
      }
      if (noscript.parentNode) {
        document.body.removeChild(noscript);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const templateParams = {
        to_email: 'jacksouto7@gmail.com',
        client_name: `${formData.firstName} ${formData.lastName}`,
        client_email: formData.email,
        client_phone: formData.phone,
        email_body: `
          <h1>New Contact Form Submission</h1>
          <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Phone:</strong> ${formData.phone}</p>
        `
      };

      await emailjs.send(
        'service_28v1fvr',
        'template_wj6zu2c',
        templateParams,
        'ezbPPmM_lDMistyGT'
      );

      setIsSubmitted(true);
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="md:w-1/2 max-w-2xl">
          <img
            src="/jackie-images/bjjmentoria.png"
            alt="Champion"
            className="w-full h-auto mb-8"
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            West Auckland — Your Health Upgrade Starts Now
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Hey Westgate and Massey whānau!
          </p>
          <h5 className="text-xl md:text-2xl font-semibold text-blue-600 mb-12">
            Fill the form below to get your FREE class!
          </h5>

          {/* Contact Form Section */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-gray-900">Get Your FREE Class</CardTitle>
              <p className="text-gray-600">Join the PT Jackie community in West Auckland</p>
            </CardHeader>
            <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="text-lg p-3 h-12"
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="text-lg p-3 h-12"
                    />
                  </div>
                </div>
                <div>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="text-lg p-3 h-12"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="text-lg p-3 h-12"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 text-xl h-14 shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  Get in Touch
                </Button>
              </form>
            ) : (
              <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-8 rounded-xl">
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 mr-3 text-green-600" />
                  <p className="text-lg font-semibold">PT Jackie will get in touch with you as soon as possible!</p>
                </div>
              </div>
            )}
            </CardContent>
          </Card>
        </div>
      </div>

       {/* Why Train with Jackie Section */}
       <div className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 -mx-4 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 md:p-12">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900">Why Train with Jackie?</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 bg-blue-50 border-blue-200">
                <CardContent className="flex items-start space-x-4 p-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-lg text-gray-700">20+ years of experience helping Kiwis achieve their fitness goals</span>
                </CardContent>
              </Card>
              
              <Card className="p-6 bg-yellow-50 border-yellow-200">
                <CardContent className="flex items-start space-x-4 p-0">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-lg text-gray-700">Coach to the BJJ National Champion of New Zealand</span>
                </CardContent>
              </Card>
              
              <Card className="p-6 bg-green-50 border-green-200">
                <CardContent className="flex items-start space-x-4 p-0">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-lg text-gray-700">Mentor to a World Champion Bodybuilder</span>
                </CardContent>
              </Card>
              
              <Card className="p-6 bg-red-50 border-red-200">
                <CardContent className="flex items-start space-x-4 p-0">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-lg text-gray-700">Now taking on new members at CityFitness Westgate</span>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6 text-center">
              <p className="text-lg text-gray-700 leading-relaxed">
                Whether you're just starting your fitness journey or looking to take it to the next level, Jackie's got your back. She's helped Kiwis of all ages move better, feel better, and build lasting healthy habits.
              </p>
              
              <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
                <CardContent className="p-6">
                  <p className="text-xl font-bold text-gray-900 flex items-center justify-center">
                    <Target className="h-6 w-6 mr-2 text-blue-600" />
                    Limited spots available for free classes at CityFitness. Don't miss out on this opportunity to train with a champion!
                  </p>
                </CardContent>
              </Card>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <CardContent>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Ready to Start Your Fitness Journey?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join the Westgate and Massey community and train with an experienced coach who gets results.
              </p>
              <Card className="bg-blue-50 border-blue-200 inline-block">
                <CardContent className="p-6 flex items-center space-x-3">
                  <MapPin className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">CityFitness Westgate</p>
                    <p className="text-gray-600">Your local fitness destination in West Auckland</p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="mt-16 pt-8 pb-6 border-t border-gray-200">
        <div className="text-center">
          <h5 className="text-xl font-semibold mb-3 text-gray-900">PT Jackie Souto</h5>
          <p className="text-gray-600 mb-6">
            Personal trainer with 20+ years of experience helping Kiwis achieve their health and fitness goals.
            Based in West Auckland.
          </p>
          <Button 
            variant="outline"
            asChild
            className="mb-6"
          >
            <a 
              href="https://www.instagram.com/soutojackie" 
              target="_blank" 
              rel="noreferrer"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Follow on Instagram
            </a>
          </Button>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} PT Jackie Souto. All rights reserved.</p>
        </div>
      </footer>
      </div>
    </div>
  );
}
