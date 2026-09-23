import React from 'react';

export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="24" fill="#0d9488" />
      {/* Stylized M with teal gradient */}
      <path
        d="M28 72V36L50 56L72 36V72"
        stroke="#FFFFFF"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="74" r="5.5" fill="#FFFFFF" />
    </svg>
  );
}
