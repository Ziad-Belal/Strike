// src/pages/ContactUs.jsx

import React from 'react';

// The function name now correctly matches the file name.
export default function ContactUs() {
  return (
    <div className="container max-w-4xl mx-auto py-16 px-4">
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }
        .contact-card {
          transition: all 0.3s ease;
        }
        .contact-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        .contact-link {
          position: relative;
          overflow: hidden;
        }
        .contact-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: -100%;
          width: 100%;
          height: 2px;
          background: #000;
          transition: left 0.3s ease;
        }
        .contact-link:hover::after {
          left: 0;
        }
      `}</style>

      <div className="text-center mb-12 animate-fade-in-down">
        <h1 className="text-5xl font-bold mb-4 text-black">Get in Touch</h1>
        <div className="w-16 h-1 bg-gradient-to-r from-black to-gray-400 mx-auto mb-6"></div>
        <p className="text-lg text-gray-600">
          We'd love to hear from you. Reach out to us through any of these channels.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12 animate-fade-in-up">
        <div className="contact-card bg-white rounded-lg border-2 border-black p-8">
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="text-2xl font-bold mb-3 text-black">Email</h2>
          <p className="text-gray-600 mb-4">Send us a message anytime</p>
          <a
            href="mailto:strikeathletics1@gmail.com"
            className="contact-link text-lg font-semibold text-black"
          >
            strikeathletics1@gmail.com
          </a>
        </div>

        <div className="contact-card bg-white rounded-lg border-2 border-black p-8">
          <div className="text-4xl mb-4">📱</div>
          <h2 className="text-2xl font-bold mb-3 text-black">Follow Us</h2>
          <p className="text-gray-600 mb-4">Connect with our community</p>
          <a
            href="https://www.instagram.com/strike_athleticss?igsh=NWtlbGgwdXZ4ZGo1"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link text-lg font-semibold text-black"
          >
            @strike_athleticss
          </a>
        </div>
      </div>

      <div className="mt-16 text-center">
        <p className="text-gray-400 text-sm">We typically respond within 24 hours</p>
      </div>
    </div>
  );
}