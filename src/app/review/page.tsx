"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Instagram } from "lucide-react";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export default function ReviewPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
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

    const noscript = document.createElement("noscript");
    noscript.innerHTML = `
      <img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=2833351920186067&ev=PageView&noscript=1"
      />
    `;
    document.body.appendChild(noscript);

    return () => {
      if (script.parentNode) document.head.removeChild(script);
      if (noscript.parentNode) document.body.removeChild(noscript);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const templateParams = {
        to_email: "jacksouto7@gmail.com",
        client_name: `${formData.firstName} ${formData.lastName}`,
        client_email: formData.email,
        client_phone: formData.phone,
        email_body: `New contact form submission from ${formData.firstName} ${formData.lastName}`,
      };

      await emailjs.send(
        "service_28v1fvr",
        "template_wj6zu2c",
        templateParams,
        "ezbPPmM_lDMistyGT"
      );

      setIsSubmitted(true);
      setFormData({ firstName: "", lastName: "", phone: "", email: "" });
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  return (
    <>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <section className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Transformations That Stick — Real Results From Jackie&apos;s Clients
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Practical training, personalised plans, measurable changes. See fast wins and long-term progress from everyday people who wanted different results — and actually got them.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <a href="/contact">30‑Min Kickstart — Only $30</a>
            </Button>
            <div className="text-sm text-gray-700">
              <strong>Proven:</strong> 20+ years • <strong>Trusted:</strong> 1,200+ client stories
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 text-center">Stories from Clients</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <img src="/jackie-images/before-after-1.jpg" alt="Testimonial 1" className="w-full h-48 object-cover" />
                <div className="p-4 text-left">
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="italic text-sm text-gray-700 mb-3">
                    &quot;Lost 12kg in 14 weeks — more energy, better sleep, and clothes that fit again. Jackie gave me a plan I could follow.&quot;
                  </p>
                  <div className="text-sm font-medium">— Sarah, Auckland</div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <img src="/jackie-images/before-after-2.jpg" alt="Testimonial 2" className="w-full h-48 object-cover" />
                <div className="p-4 text-left">
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="italic text-sm text-gray-700 mb-3">
                    &quot;Back pain eased in 8 sessions and I can now train without fear. The coaching is clear, practical and motivating.&quot;
                  </p>
                  <div className="text-sm font-medium">— Mark, Wellington</div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <img src="/jackie-images/before-after-3.jpg" alt="Testimonial 3" className="w-full h-48 object-cover" />
                <div className="p-4 text-left">
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="italic text-sm text-gray-700 mb-3">
                    &quot;Gained strength and confidence — I beat my plateau and have a plan that fits my busy week. Sustainable results, not short term fixes.&quot;
                  </p>
                  <div className="text-sm font-medium">— Emma, Christchurch</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-8 text-gray-900 text-center">
            Client Messages
          </h3>
          <div className="columns-2 md:columns-4 gap-2 space-y-2">
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
        </section>

        <section className="mb-12 text-center">
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold mb-2">Ready to start?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Book a free consultation and see what a personalised plan looks like.
              </p>
              <div className="flex items-center justify-center space-x-3">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <a href="/contact">Book Your Free Consultation</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/contact">Contact Jackie</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h3 className="text-lg font-semibold mb-4">Get in touch</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                    />
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                    />
                  </div>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                  />
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone"
                  />
                  <div className="flex items-center space-x-3">
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Send
                    </Button>
                    {isSubmitted && (
                      <Badge variant="secondary">Thanks! We&apos;ll be in touch.</Badge>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div>
              <h4 className="text-sm font-semibold mb-2">Follow Jackie</h4>
              <p className="text-sm text-gray-600 mb-4">
                See daily tips, client wins and short workouts on Instagram.
              </p>
              <Button asChild variant="outline">
                <a
                  href="https://www.instagram.com/soutojackie"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Instagram className="w-4 h-4 mr-2" /> Follow on Instagram
                </a>
              </Button>
            </div>
          </div>
        </section>

        <footer className="mt-20 pt-8 pb-6 border-t border-gray-200">
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <h5 className="text-xl font-semibold mb-3 text-gray-900">
                PT Jackie Souto
              </h5>
              <p className="text-gray-600 mb-6">
                Personal trainer with 20+ years of experience helping Kiwis
                achieve their health and fitness goals. Based in West Auckland.
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
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} PT Jackie Souto. All rights reserved.
              </p>
            </CardContent>
          </Card>
        </footer>
      </main>
    </>
  );
}
