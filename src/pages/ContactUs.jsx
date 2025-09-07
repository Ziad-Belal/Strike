// src/pages/ContactUs.jsx

import React from 'react';

// The function name now correctly matches the file name.
export default function ContactUs() {
  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
      
      <div className="space-y-4 text-lg text-gray-700">
        <p>
          We'd love to hear from you! Whether you have a question about our products, an order, or just want to say hello, feel free to reach out.
        </p>
        <p>
          The best way to get in touch is by sending an email to our support team at:
        </p>
        <p className="font-semibold text-black">
          strikeathletics1@gmail.com
        </p>
      </div>
    </div>
  );
}