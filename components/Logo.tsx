import React from 'react';

export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    // <svg
    //   viewBox="0 0 100 100"
    //   className={className}
    //   fill="none"
    //   xmlns="http://www.w3.org/2000/svg"
    // >
    //   <rect width="100" height="100" rx="24" fill="#0d9488" />
    //   {/* Stylized M with teal gradient */}
    //   <path
    //     d="M28 72V36L50 56L72 36V72"
    //     stroke="#FFFFFF"
    //     strokeWidth="11"
    //     strokeLinecap="round"
    //     strokeLinejoin="round"
    //   />
    //   <circle cx="50" cy="74" r="5.5" fill="#FFFFFF" />
    // </svg>
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="fnfGradient"
          x1="15"
          y1="15"
          x2="85"
          y2="85"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#14b8a6" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>

        <linearGradient
          id="fiberGradient"
          x1="20"
          y1="70"
          x2="85"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5eead4" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect
        width="100"
        height="100"
        rx="24"
        fill="#073b4c"
      />

      {/* FNF Logo */}
      <path
        d="M18 62V34H39"
        stroke="#FFFFFF"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M18 48H35"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* N / Fiber shape */}
      <path
        d="M43 62V38L60 59V34"
        stroke="url(#fnfGradient)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* F */}
      <path
        d="M67 62V34H88"
        stroke="#FFFFFF"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M67 48H83"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Fiber connection arc */}
      <path
        d="M13 69C34 78 63 78 87 64"
        stroke="url(#fiberGradient)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Fiber strands */}
      <path
        d="M72 70C80 67 86 63 91 57"
        stroke="#22d3ee"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M77 72C84 68 90 63 94 58"
        stroke="#2dd4bf"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Fiber nodes */}
      <circle cx="91" cy="57" r="2.5" fill="#67e8f9" />
      <circle cx="94" cy="58" r="2" fill="#5eead4" />

      {/* WiFi signal */}
      <path
        d="M43 25C48 20 57 20 62 25"
        stroke="#5eead4"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      <path
        d="M47 29C50 26 55 26 58 29"
        stroke="#22d3ee"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      <circle
        cx="52.5"
        cy="33"
        r="2.2"
        fill="#5eead4"
      />
    </svg>

  );
}

