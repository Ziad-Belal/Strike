import React from 'react';

export default function AboutPage() {
  return (
    <div className="container max-w-3xl mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold mb-16 text-black">About Strike</h1>

      <div className="space-y-12">
        <div>
          <p className="text-lg text-gray-800 leading-relaxed">
            Strike wasn't born overnight. It's the result of pure passion, commitment, and over half a century of textile mastery. To create the ultimate activewear, we traveled the length of Egypt just to source the finest, toughest fabrics out there. No cutting corners. Every stitch is proof of the craft, and every single design is built to endure.
          </p>
        </div>

        <div className="border-t border-gray-100"></div>

        <div>
          <p className="text-lg text-gray-800 leading-relaxed">
            We build exclusively for an elite community of athletes who share a singular, unstoppable drive. The kind of people who look at an obstacle and see an invitation to prove who they are. No fear. No hesitation. No delay.
          </p>
        </div>

        <div className="border-t border-gray-100"></div>

        <div>
          <p className="text-lg text-gray-800 leading-relaxed">
            When challenges show up, we don't back down. We Strike.
          </p>
        </div>
      </div>
    </div>
  );
}
