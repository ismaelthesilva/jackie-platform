import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import emailjs from '@emailjs/browser';

const LandingPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      document.head.removeChild(script);
      document.body.removeChild(noscript);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
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
    <div className="container text-center mt-5">
      {/* Hero Section */}
      <div className="row justify-content-center align-items-center">
        <div className="col-md-6">
          <img
            src="/jackie-images/bjjmentoria.png"
            alt="Champion"
            className="img-fluid mb-3"
          />
          <h1 className="fw-bold">
            West Auckland — Your Health Upgrade Starts Now
          </h1>
          <p className="mt-2 text-muted">
            Hey Westgate and Massey whānau!
          </p>
          <h5 className="text-primary fw-semibold">
            Fill the form below to get your FREE class!
          </h5>
        </div>
      </div>

     {/* Contact Form Section */}
      <div className="mt-5">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="row justify-content-center">
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <input
                    type="text"
                    name="firstName"
                    className="form-control"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <input
                    type="text"
                    name="lastName"
                    className="form-control"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-success btn-lg fw-bold shadow-sm">
                Get in Touch
              </button>
            </div>
          </form>
        ) : (
          <div className="alert alert-success" role="alert">
            PT Jackie will get in touch with you as soon as possible!
          </div>
        )}
      </div>

       {/* Kiwi-friendly Copy Section */}
       <div className="mt-4 mb-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="p-4 bg-light rounded shadow-sm">
              <h3 className="fw-bold mb-4">Why Train with Jackie?</h3>
              <ul className="list-unstyled">
                <li className="mb-3">👊 20+ years of experience helping Kiwis achieve their fitness goals</li>
                <li className="mb-3">🥇 Coach to the BJJ National Champion of New Zealand</li>
                <li className="mb-3">🏆 Mentor to a World Champion Bodybuilder</li>
                <li className="mb-3">❤️ Now taking on new members at CityFitness Westgate</li>
              </ul>
              <p className="mt-4">
                Whether you're just starting your fitness journey or looking to take it to the next level, Jackie's got your back. She's helped Kiwis of all ages move better, feel better, and build lasting healthy habits.
              </p>
              <p className="mt-3 fw-bold">
                👉 Limited spots available for free classes at CityFitness. Don't miss out on this opportunity to train with a champion!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;