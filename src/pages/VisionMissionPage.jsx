import React from 'react';

export default function VisionMissionPage() {
  return (
    <div className="container max-w-3xl mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold mb-16 text-black">Vision & Mission</h1>

      <div className="space-y-12">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">Vision</h2>
          <p className="text-lg text-gray-800 leading-relaxed">
            To build a community where every athlete has the mindset to face obstacles head-on, using our performance gear to push past their limits.
          </p>
        </div>

        <div className="border-t border-gray-100"></div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">Mission</h2>
          <p className="text-lg text-gray-800 leading-relaxed">
            To design and manufacture apparel that perfectly fits each and every athlete, ensuring you're fully locked in every time you step into your game.
          </p>
        </div>
      </div>
    </div>
  );
}
