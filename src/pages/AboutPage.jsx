// src/pages/AboutPage.jsx

import React, { useState, useEffect } from 'react';

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out;
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.7s ease-out;
        }
        .accent-highlight {
          position: relative;
          background: linear-gradient(120deg, rgba(0,0,0,0.05), rgba(0,0,0,0.1));
          padding: 2px 8px;
          border-radius: 4px;
        }
        .about-section {
          padding: 2rem;
          border-left: 4px solid black;
          background: linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 100%);
        }
      `}</style>

      <div className="text-center mb-12 animate-fade-in-down">
        <h1 className="text-5xl font-bold mb-4 text-black">About Strike</h1>
        <div className="w-16 h-1 bg-gradient-to-r from-black to-gray-400 mx-auto mb-6"></div>
        <p className="text-lg text-gray-600">Our story, our craft, our mindset</p>
      </div>

      <div className="space-y-6 mt-12">
        <div className="about-section animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
          <p className="text-lg text-gray-700 leading-relaxed">
            Strike wasn't born overnight. It's the result of pure passion, commitment, and <span className="accent-highlight font-semibold">over half a century of textile mastery</span>. To create the ultimate activewear, we traveled the length of Egypt just to source the finest, toughest fabrics out there. No cutting corners. Every stitch is proof of the craft, and every single design is built to endure.
          </p>
        </div>

        <div className="bg-black text-white rounded-lg p-6 my-8 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
          <p className="text-2xl font-bold text-center">But Strike is more than premium gear,<br />it's a <span className="underline">mindset</span>.</p>
        </div>

        <div className="about-section animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
          <p className="text-lg text-gray-700 leading-relaxed">
            We build exclusively for an <span className="accent-highlight font-semibold">elite community of athletes</span> who share a singular, unstoppable drive. The kind of people who look at an obstacle and see an invitation to prove who they are. No fear. No hesitation. No delay.
          </p>
        </div>

        <div className="about-section bg-gradient-to-r from-black to-gray-900 text-white animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
          <p className="text-lg font-bold leading-relaxed">
            When challenges show up, we don't back down.
            <br /><span className="text-2xl">We <span className="underline">Strike</span>.</span>
          </p>
        </div>
      </div>

      <div className="mt-16 text-center">
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-black"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          <div className="w-2 h-2 rounded-full bg-black"></div>
        </div>
      </div>
    </div>
  );
}