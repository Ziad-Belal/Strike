// src/pages/VisionMissionPage.jsx

import React from 'react';

export default function VisionMissionPage() {
  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-6 text-center">Our Vision & Mission</h1>
      
      <div className="space-y-8 text-lg text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Vision</h2>
          <p>
            To be the leading athletic apparel brand that inspires and equips the next generation of athletes to push their boundaries. We envision a world where performance wear is not just functional, but a catalyst for movement, confidence, and personal achievement.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
          <p>
            Our mission is to empower every individual's athletic journey by creating innovative, high-quality, and stylish performance wear. We are committed to merging cutting-edge design with sustainable practices, ensuring our customers not only perform their best but also feel great about the gear they wear. We strive to build a community grounded in passion, resilience, and the relentless pursuit of progress.
          </p>
        </section>
      </div>
    </div>
  );
}