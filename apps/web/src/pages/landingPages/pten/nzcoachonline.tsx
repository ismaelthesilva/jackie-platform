'use client'

import React, { useState, useEffect } from "react";
import emailjs from '@emailjs/browser';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

const NZCoachOnline: React.FC = () => {
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
          <form onSubmit={handleSubmit} className="flex justify-center">
            <div className="w-full md:w-1/2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="firstName"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="tel"
                  name="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-6">
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
              >
                Click here for your FREE Consultation!
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg max-w-md mx-auto">
            PT Jackie will get in touch with you as soon as possible!
          </div>
        )}
      </div>

       {/* Kiwi-friendly Copy Section */}
       <div className="mt-16 mb-12">
        <div className="flex justify-center">
          <div className="w-full md:w-2/3">
            <div className="bg-gray-50 p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Why Train with Jackie?</h3>
              <ul className="space-y-4 text-left">
                <li className="flex items-center">
                  <span className="text-2xl mr-3">👊</span>
                  <span>20+ years of experience helping Kiwis achieve their fitness goals</span>
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-3">🥇</span>
                  <span>Coach to the BJJ National Champion of New Zealand</span>
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-3">🏆</span>
                  <span>Mentor to a World Champion Bodybuilder</span>
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-3">❤️</span>
                  <span>Now taking on new members at CityFitness Westgate</span>
                </li>
              </ul>
              <p className="mt-6 text-gray-700">
                Whether you're just starting your fitness journey or looking to take it to the next level, Jackie's got your back. She's helped Kiwis of all ages move better, feel better, and build lasting healthy habits.
              </p>
              <p className="mt-4 font-bold text-gray-900">
                👉 Limited spots available for free classes at CityFitness. Don't miss out on this opportunity to train with a champion!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BJJ Champ & Bodybuilder Photos */}
      <div className="mt-16 mb-12">
        <h3 className="text-2xl font-bold mb-8 text-gray-900">What Champions look like</h3>
          <div className="flex justify-center mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8 max-w-2xl">
              <div className="text-center">
                <img 
                  src="/jackie-images/isma-champ.jpg" 
                  alt="BJJ National Champion" 
                  className="w-full h-auto rounded-lg shadow-md mb-3" 
                />
                <p className="text-sm font-semibold text-gray-700">New Zealand BJJ National Champion</p>
              </div>
              <div className="text-center">
                <img 
                  src="/jackie-images/miguel-oliveira.jpg" 
                  alt="World Champion Bodybuilder" 
                  className="w-full h-auto rounded-lg shadow-md mb-3" 
                />
                <p className="text-sm font-semibold text-gray-700">World Champion Bodybuilder</p>
              </div>
            </div>
          </div>
      </div>

      {/* Testimonials Section */}
      <div className="mt-16 mb-12">
        <h3 className="text-2xl font-bold mb-8 text-gray-900">What Kiwis Say</h3>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl">
            <div className="text-center">
              <img 
                src="/jackie-images/before-after-1.jpg" 
                alt="Testimonial 1" 
                className="w-full h-auto rounded-lg shadow-md mb-3" 
              />
              <p className="italic text-sm text-gray-600">"Jackie helped me get my energy back and feel confident again!"</p>
            </div>
            <div className="text-center">
              <img 
                src="/jackie-images/before-after-2.jpg" 
                alt="Testimonial 2" 
                className="w-full h-auto rounded-lg shadow-md mb-3" 
              />
              <p className="italic text-sm text-gray-600">"Her support made all the difference. I never thought I could enjoy training from home."</p>
            </div>
            <div className="text-center">
              <img 
                src="/jackie-images/before-after-3.jpg" 
                alt="Testimonial 3" 
                className="w-full h-auto rounded-lg shadow-md mb-3" 
              />
              <p className="italic text-sm text-gray-600">"Jackie's experience shows—she knows how to motivate and guide you every step."</p>
            </div>
          </div>
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
        <div className="flex justify-center">
          <div className="w-full md:w-2/3 text-center">
            <h5 className="text-xl font-semibold mb-3 text-gray-900">PT Jackie Souto</h5>
            <p className="text-gray-600 mb-6">
              Personal trainer with 20+ years of experience helping Kiwis achieve their health and fitness goals.
              Based on West Auckland.
            </p>
            <a 
              href="https://www.instagram.com/soutojackie" 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white font-medium py-2 px-4 rounded-md transition duration-300 mb-6"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Follow on Instagram
            </a>
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} PT Jackie Souto. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NZCoachOnline;
