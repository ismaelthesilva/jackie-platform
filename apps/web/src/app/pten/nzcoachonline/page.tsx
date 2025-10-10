'use client';

import React, { useState, useEffect } from "react";
import emailjs from '@emailjs/browser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Trophy, Heart, Instagram, ArrowRight } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export default function NZCoachOnlinePage() {
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
    <div className="max-w-6xl mx-auto px-4 py-8 text-center">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center">
        <div className="md:w-1/2">
          <img
            src="/jackie-images/bjjmentoria.png"
            alt="Champion"
            className="w-full h-auto mb-6"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            New Zealand — Your Health Upgrade Starts Now
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Kia ora whānau in New Zealand Aotearoa!
          </p>
          
          {/* Video Section */}
          <div className="mb-8">
            <div className="relative w-full aspect-video max-w-full mx-auto">
              <video 
                src="/jackie-images/messages/video1.mp4" 
                className="w-full h-full rounded-lg shadow-md" 
                controls
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          
          <h5 className="text-xl font-semibold text-blue-600 mb-8">
            Fill the form below to get your FREE class!
          </h5>
        </div>
      </div>

     {/* Contact Form Section */}
      <div className="mt-12">
        {!isSubmitted ? (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">Get Your FREE Consultation</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="text-base p-3"
                  />
                  <Input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="text-base p-3"
                  />
                </div>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="text-base p-3"
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="text-base p-3"
                />
                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 shadow-md transition duration-300"
                >
                  Click here for your FREE Consultation!
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-green-700 font-medium">
                PT Jackie will get in touch with you as soon as possible!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

       {/* Kiwi-friendly Copy Section */}
       <div className="mt-16 mb-12">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900">Why Train with Jackie?</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-gray-800">20+ years of experience helping Kiwis achieve their fitness goals</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="text-gray-800">Coach to the BJJ National Champion of New Zealand</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-gray-800">Mentor to a World Champion Bodybuilder</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-gray-800">Now taking on new members at CityFitness Westgate</span>
              </div>
            </div>
            <div className="space-y-4 text-center">
              <p className="text-gray-700 text-lg">
                Whether you're just starting your fitness journey or looking to take it to the next level, Jackie's got your back. She's helped Kiwis of all ages move better, feel better, and build lasting healthy habits.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="font-bold text-orange-800">
                  👉 Limited spots available for free classes at CityFitness. Don't miss out on this opportunity to train with a champion!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BJJ Champ & Bodybuilder Photos */}
      <div className="mt-16 mb-12">
        <h3 className="text-2xl font-bold mb-8 text-gray-900 text-center">What Champions Look Like</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <img 
                src="/jackie-images/isma-champ.jpg" 
                alt="BJJ National Champion" 
                className="w-full h-64 object-cover" 
              />
              <div className="p-4">
                <Badge className="bg-yellow-100 text-yellow-800 mb-2">
                  <Trophy className="h-4 w-4 mr-1" />
                  National Champion
                </Badge>
                <p className="font-semibold text-gray-900">New Zealand BJJ National Champion</p>
                <p className="text-sm text-gray-600 mt-1">Trained by Jackie Souto</p>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <img 
                src="/jackie-images/miguel-oliveira.jpg" 
                alt="World Champion Bodybuilder" 
                className="w-full h-64 object-cover" 
              />
              <div className="p-4">
                <Badge className="bg-purple-100 text-purple-800 mb-2">
                  <Trophy className="h-4 w-4 mr-1" />
                  World Champion
                </Badge>
                <p className="font-semibold text-gray-900">World Champion Bodybuilder</p>
                <p className="text-sm text-gray-600 mt-1">Mentored by Jackie Souto</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mt-16 mb-12">
        <h3 className="text-2xl font-bold mb-8 text-gray-900 text-center">What Kiwis Say</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <img 
                src="/jackie-images/before-after-1.jpg" 
                alt="Testimonial 1" 
                className="w-full h-48 object-cover" 
              />
              <div className="p-4">
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-sm text-gray-600">"Jackie helped me get my energy back and feel confident again!"</p>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <img 
                src="/jackie-images/before-after-2.jpg" 
                alt="Testimonial 2" 
                className="w-full h-48 object-cover" 
              />
              <div className="p-4">
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-sm text-gray-600">"Her support made all the difference. I never thought I could enjoy training from home."</p>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <img 
                src="/jackie-images/before-after-3.jpg" 
                alt="Testimonial 3" 
                className="w-full h-48 object-cover" 
              />
              <div className="p-4">
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-sm text-gray-600">"Jackie's experience shows—she knows how to motivate and guide you every step."</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Messages - Masonry Layout */}
      <div className="mt-16 mb-12">
        <h3 className="text-2xl font-bold mb-8 text-gray-900">Client Messages</h3>
        <div className="columns-2 md:columns-4 gap-2 space-y-2">
          {/* Column 1 */}
          <div className="break-inside-avoid mb-2">
            <img 
              src="/jackie-images/messages/message1.jpg" 
              alt="Client Message 1" 
              className="w-full rounded-lg shadow-md" 
            />
          </div>
          <div className="break-inside-avoid mb-2">
            <img 
              src="/jackie-images/messages/message5.jpg" 
              alt="Client Message 5" 
              className="w-full rounded-lg shadow-md" 
            />
          </div>
          
          {/* Column 2 */}
          <div className="break-inside-avoid mb-2">
            <img 
              src="/jackie-images/messages/message2.jpg" 
              alt="Client Message 2" 
              className="w-full rounded-lg shadow-md" 
            />
          </div>
          <div className="break-inside-avoid mb-2">
            <img 
              src="/jackie-images/messages/message6.jpg" 
              alt="Client Message 6" 
              className="w-full rounded-lg shadow-md" 
            />
          </div>
          
          {/* Column 3 */}
          <div className="break-inside-avoid mb-2">
            <img 
              src="/jackie-images/messages/message3.jpg" 
              alt="Client Message 3" 
              className="w-full rounded-lg shadow-md" 
            />
          </div>
          <div className="break-inside-avoid mb-2">
            <img 
              src="/jackie-images/messages/message7.jpg" 
              alt="Client Message 7" 
              className="w-full rounded-lg shadow-md" 
            />
          </div>
          
          {/* Column 4 */}
          <div className="break-inside-avoid mb-2">
            <img 
              src="/jackie-images/messages/message4.jpg" 
              alt="Client Message 4" 
              className="w-full rounded-lg shadow-md" 
            />
          </div>
          <div className="break-inside-avoid mb-2">
            <img 
              src="/jackie-images/messages/message8.jpg" 
              alt="Client Message 8" 
              className="w-full rounded-lg shadow-md" 
            />
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="mt-20 pt-8 pb-6 border-t border-gray-200">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h5 className="text-xl font-semibold mb-3 text-gray-900">PT Jackie Souto</h5>
            <p className="text-gray-600 mb-6">
              Personal trainer with 20+ years of experience helping Kiwis achieve their health and fitness goals.
              Based on West Auckland.
            </p>
            <Button 
              variant="outline"
              asChild
              className="mb-6 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
            >
              <a 
                href="https://www.instagram.com/soutojackie" 
                target="_blank" 
                rel="noreferrer"
              >
                <Instagram className="w-4 h-4 mr-2" />
                Follow on Instagram
              </a>
            </Button>
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} PT Jackie Souto. All rights reserved.</p>
          </CardContent>
        </Card>
      </footer>
    </div>
  );
};


