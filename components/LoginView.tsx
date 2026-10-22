// 'use client';

// import React, { useState } from 'react';
// import { motion } from 'motion/react';
// import Logo from './Logo';
// import { User } from '@/lib/types';
// import bgImage from '@/src/assets/bg-image.jpg'


// interface LoginViewProps {
//   onLoginSuccess: (user: User) => void;
//   onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
// }

// export default function LoginView({ onLoginSuccess, onShowToast }: LoginViewProps) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       const res = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: email.trim(), password }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         setError(data.error || 'Authentication failed. Please verify credentials.');
//         setLoading(false);
//         if (onShowToast) {
//           onShowToast('Authentication failed. Check email or password.', 'error');
//         }
//         return;
//       }

//       if (onShowToast) {
//         onShowToast(`Welcome, ${data.user.name} (${data.user.role.toUpperCase()})`, 'success');
//       }
//       onLoginSuccess(data.user);
//     } catch (err) {
//       console.error(err);
//       setError('Connection error. Could not reach server.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="min-h-screen w-full bg-surface-container-low flex flex-col justify-center items-center p-4 bg-cover bg-center bg-no-repeat backdrop-blur-md bg-black/30 bg-blend-darken"
//       style={{ backgroundImage: `url(${bgImage.src || bgImage})` }}
//     >
//       <motion.div
//         initial={{ opacity: 0, y: 16, scale: 0.98 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.25 }}
//         className="max-w-sm w-full bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 p-7 flex flex-col gap-5"
//       >
//         {/* Brand Header */}
//         <div className="flex flex-col items-center text-center gap-1">
//           {/* <Logo className="h-10 w-10" /> */}
//           <img
//             src="/fnf-logo.png"
//             alt="FnF Online Logo"
//             className="h-20 w-20 object-cover"
//           />
//           <div>
//             <h1 className="text-xl font-bold text-on-surface"> First n Fast IT LTD</h1>
//             <p className="text-xs text-secondary mt-0.5">Billing Management Console</p>
//           </div>
//         </div>

//         {error && (
//           <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
//             <span className="material-symbols-outlined text-base">error</span>
//             <span>{error}</span>
//           </div>
//         )}

//         {/* Login Form */}
//         <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
//           <div className="flex flex-col gap-1">
//             <label className="font-semibold text-secondary uppercase">
//               Email Address
//             </label>
//             <input
//               type="email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="name@company.com"
//               className="h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs"
//             />
//           </div>

//           <div className="flex flex-col gap-1">
//             <label className="font-semibold text-secondary uppercase">
//               Password
//             </label>
//             <input
//               type="password"
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••"
//               className="h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="mt-2 h-10 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
//           >
//             {loading ? (
//               <span>Authenticating...</span>
//             ) : (
//               <>
//                 <span className="material-symbols-outlined text-base">login</span>
//                 <span>Sign In</span>
//               </>
//             )}
//           </button>
//         </form>
//       </motion.div>
//     </div>
//   );
// }



// =============2nd============



'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { User } from '@/lib/types';

// Background images list (apni apnar 4/5 ta image er path ekhane add kore din)
import bgImage1 from '@/src/assets/bg-image-1.jpg';
import bgImage2 from '@/src/assets/bg-image-2.jpg';
import bgImage3 from '@/src/assets/bg-image-3.jpg';
import bgImage4 from '@/src/assets/bg-image-4.jpg';
import bgImage5 from '@/src/assets/bg-image-5.jpg';
import bgImage6 from '@/src/assets/bg-image-6.jpg';

const backgroundImages = [
  bgImage1,
  bgImage2,
  bgImage3,
  bgImage4,
  bgImage5,
  // bgImage6
  
];

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function LoginView({ onLoginSuccess, onShowToast }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Background Slider State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Timer for changing background image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000); // 5000ms = 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please verify credentials.');
        setLoading(false);
        if (onShowToast) {
          onShowToast('Authentication failed. Check email or password.', 'error');
        }
        return;
      }

      if (onShowToast) {
        onShowToast(`Welcome, ${data.user.name} (${data.user.role.toUpperCase()})`, 'success');
      }
      onLoginSuccess(data.user);
    } catch (err) {
      console.error(err);
      setError('Connection error. Could not reach server.');
    } finally {
      setLoading(false);
    }
  };

  const currentBg = backgroundImages[currentImageIndex];
  const bgSrc = typeof currentBg === 'object' && currentBg !== null && 'src' in currentBg 
    ? (currentBg as { src: string }).src 
    : (currentBg as string);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center p-4 overflow-hidden bg-surface-container-low">
      
      {/* Background Slideshow with Framer Motion */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat backdrop-blur-md bg-black/40 bg-blend-darken z-0"
          style={{ backgroundImage: `url(${bgSrc})` }}
        />
      </AnimatePresence>

      {/* Login Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 max-w-sm w-full bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 p-7 flex flex-col gap-5"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-1">
          <img
            src="/fnf-logo.png"
            alt="FnF Online Logo"
            className="h-20 w-20 object-cover"
          />
          <div>
            <h1 className="text-xl font-bold text-on-surface">First n Fast IT LTD</h1>
            <p className="text-xs text-secondary mt-0.5">Billing Management Console</p>
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-secondary uppercase">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-secondary uppercase">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-10 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">login</span>
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}