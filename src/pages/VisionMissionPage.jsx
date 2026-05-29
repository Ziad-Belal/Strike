// src/pages/VisionMissionPage.jsx

import React from 'react';

export default function VisionMissionPage() {
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
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.6s ease-out;
        }
        .vision-mission-card {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }
        .vision-mission-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.02);
          transition: left 0.5s ease;
          z-index: 0;
        }
        .vision-mission-card:hover::before {
          left: 100%;
        }
        .vision-mission-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
        }
        .card-content {
          position: relative;
          z-index: 1;
        }
        .icon-box {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
        }
        .vision-icon {
          background: linear-gradient(135deg, #000 0%, #333 100%);
          color: white;
        }
        .mission-icon {
          background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
          color: white;
        }
      `}</style>

      <div className="text-center mb-14 animate-fade-in-down">
        <h1 className="text-5xl font-bold mb-4 text-black">Vision & Mission</h1>
        <div className="w-16 h-1 bg-gradient-to-r from-black to-gray-400 mx-auto"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div className="vision-mission-card bg-white rounded-xl border-2 border-black p-8 animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="card-content">
            <div className="icon-box vision-icon">🎯</div>
            <h2 className="text-3xl font-bold mb-4 text-black">Our Vision</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              To build a community where every athlete has the mindset to face obstacles head-on, using our performance gear to push past their limits.
            </p>
          </div>
        </div>

        <div className="vision-mission-card bg-white rounded-xl border-2 border-black p-8 animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <div className="card-content">
            <div className="icon-box mission-icon">⚡</div>
            <h2 className="text-3xl font-bold mb-4 text-black">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              To design and manufacture apparel that perfectly fits each and every athlete, ensuring you're fully locked in every time you step into your game.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 flex justify-center">
        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-black to-transparent"></div>
      </div>
    </div>
  );
}