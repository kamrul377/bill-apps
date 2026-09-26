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




// import React from 'react';

// export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 100 100"
//       className={className}
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       {/* Background Rounded Square */}
//       <rect width="100" height="100" rx="24" fill="#0d9488" />

//       {/* Modern FnF Text Concept */}
//       <g stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
//         {/* First 'F' */}
//         <path d="M 22 30 V 70 M 22 30 H 38 M 22 48 H 34" />

//         {/* Lowercase 'n' */}
//         <path d="M 44 48 V 70 M 44 56 C 44 46, 56 46, 56 56 V 70" fill="none" />

//         {/* Second 'F' */}
//         <path d="M 64 30 V 70 M 64 30 H 80 M 64 48 H 76" />
//       </g>

//       {/* Stylized Accent Dot */}
//       <circle cx="50" cy="32" r="4" fill="#FFFFFF" />
//     </svg>
//   );
// }












// import React from 'react';

// export default function Logo({ className = "h-28 w-auto" }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 500 240"
//       className={className}
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <defs>
//         {/* Sleek Gradient Palette */}
//         <linearGradient id="fnfDarkGreen" x1="0%" y1="0%" x2="0%" y2="100%">
//           <stop offset="0%" stopColor="#0B6623" />
//           <stop offset="100%" stopColor="#053B13" />
//         </linearGradient>

//         <linearGradient id="fnfBrightGreen" x1="0%" y1="0%" x2="100%" y2="100%">
//           <stop offset="0%" stopColor="#43A047" />
//           <stop offset="100%" stopColor="#2E7D32" />
//         </linearGradient>

//         {/* Clean Shadow */}
//         <filter id="cleanShadow" x="-10%" y="-10%" width="120%" height="120%">
//           <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.08" />
//         </filter>
//       </defs>

//       {/* --- PROFESSIONAL FRAME / CONTAINER --- */}
//       {/* Outer Sharp Rounded Card */}
//       <rect
//         x="8"
//         y="8"
//         width="484"
//         height="224"
//         rx="16"
//         fill="#FFFFFF"
//         stroke="#0B6623"
//         strokeWidth="3"
//         filter="url(#cleanShadow)"
//       />

//       {/* Inner Accent Line Frame */}
//       <rect
//         x="16"
//         y="16"
//         width="468"
//         height="208"
//         rx="10"
//         fill="none"
//         stroke="#43A047"
//         strokeWidth="1.5"
//       />

//       {/* --- TOP ICON: ANTENNA + SIGNALS --- */}
//       <g transform="translate(250, 26)">
//         {/* Antenna Pole */}
//         <line x1="0" y1="0" x2="0" y2="28" stroke="url(#fnfDarkGreen)" strokeWidth="4" strokeLinecap="round" />
//         <circle cx="0" cy="-2" r="3.5" fill="url(#fnfBrightGreen)" />

//         {/* Waves Left */}
//         <path d="M -8 -2 A 10 10 0 0 0 -8 18" stroke="url(#fnfDarkGreen)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
//         <path d="M -15 -8 A 18 18 0 0 0 -15 24" stroke="url(#fnfDarkGreen)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
//         <path d="M -22 -14 A 26 26 0 0 0 -22 30" stroke="url(#fnfDarkGreen)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

//         {/* Waves Right */}
//         <path d="M 8 -2 A 10 10 0 0 1 8 18" stroke="url(#fnfDarkGreen)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
//         <path d="M 15 -8 A 18 18 0 0 1 15 24" stroke="url(#fnfDarkGreen)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
//         <path d="M 22 -14 A 26 26 0 0 1 22 30" stroke="url(#fnfDarkGreen)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
//       </g>

//       {/* --- SKYLINE / TOWER BUILDINGS --- */}
//       <g transform="translate(0, 8)" fill="url(#fnfDarkGreen)">
//         <rect x="202" y="78" width="10" height="46" rx="1" />
//         <rect x="214" y="66" width="12" height="58" rx="1" />
//         <rect x="228" y="52" width="14" height="72" rx="1" />
//         {/* Main Center Structure */}
//         <rect x="244" y="44" width="12" height="80" rx="1" fill="#053B13" />
//         <rect x="258" y="58" width="13" height="66" rx="1" />
//         <rect x="273" y="70" width="11" height="54" rx="1" />
//         <rect x="286" y="82" width="10" height="42" rx="1" />
//       </g>

//       {/* --- SWOOSH & MOUSE --- */}
//       <path
//         d="M 140 115 C 130 75, 330 70, 350 102 C 360 118, 280 132, 320 134"
//         stroke="url(#fnfBrightGreen)"
//         strokeWidth="4.5"
//         strokeLinecap="round"
//         fill="none"
//       />

//       {/* Computer Mouse */}
//       <g transform="translate(318, 126)">
//         <rect x="0" y="0" width="18" height="24" rx="9" fill="url(#fnfDarkGreen)" />
//         <line x1="9" y1="4" x2="9" y2="10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
//       </g>

//       {/* --- TEXT: FnF online --- */}
//       <g transform="translate(42, 142)">
//         {/* F */}
//         <path d="M 10 10 H 38 V 19 H 21 V 26 H 34 V 34 H 21 V 52 H 10 Z" fill="url(#fnfDarkGreen)" />
//         <path d="M 10 10 L 20 0 L 46 0 L 36 10 Z" fill="url(#fnfBrightGreen)" />

//         {/* n */}
//         <path d="M 50 21 H 60 V 27 C 64 22, 70 20, 78 20 C 88 20, 93 25, 93 36 V 52 H 82 V 37 C 82 31, 79 28, 73 28 C 67 28, 60 32, 60 39 V 52 H 50 Z" fill="url(#fnfBrightGreen)" />

//         {/* F */}
//         <path d="M 100 10 H 128 V 19 H 111 V 26 H 124 V 34 H 111 V 52 H 100 Z" fill="url(#fnfDarkGreen)" />
//         <path d="M 100 10 L 110 0 L 136 0 L 126 10 Z" fill="url(#fnfBrightGreen)" />

//         {/* Power O */}
//         <g transform="translate(142, 14)">
//           <path
//             d="M 10 20 A 17 17 0 1 0 34 20"
//             fill="none"
//             stroke="url(#fnfDarkGreen)"
//             strokeWidth="6"
//             strokeLinecap="round"
//           />
//           <line x1="22" y1="5" x2="22" y2="22" stroke="url(#fnfBrightGreen)" strokeWidth="5" strokeLinecap="round" />
//         </g>

//         {/* nline */}
//         <g fill="url(#fnfDarkGreen)">
//           {/* n */}
//           <path d="M 190 21 H 200 V 27 C 204 22, 210 20, 218 20 C 228 20, 233 25, 233 36 V 52 H 222 V 37 C 222 31, 219 28, 213 28 C 207 28, 200 32, 200 39 V 52 H 190 Z" />
//           {/* l */}
//           <rect x="238" y="8" width="9" height="44" rx="3" />
//           {/* i */}
//           <rect x="252" y="21" width="9" height="31" rx="3" />
//           <circle cx="256.5" cy="12" r="4.5" fill="url(#fnfBrightGreen)" />
//           {/* n */}
//           <path d="M 267 21 H 277 V 27 C 281 22, 287 20, 295 20 C 305 20, 310 25, 310 36 V 52 H 299 V 37 C 299 31, 296 28, 290 28 C 284 28, 277 32, 277 39 V 52 H 267 Z" />
//           {/* e */}
//           <path d="M 319 36 C 319 26, 326 20, 338 20 C 349 20, 355 27, 355 37 V 40 H 329 C 330 45, 334 47, 340 47 C 345 47, 348 45, 350 42 H 358 C 356 49, 349 53, 340 53 C 327 53, 319 45, 319 36 Z M 346 33 C 345 28, 342 25, 337 25 C 332 25, 329 28, 328 33 Z" />
//         </g>
//       </g>
//     </svg>
//   );
// }