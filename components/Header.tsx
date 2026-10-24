// 'use client';

// import React from 'react';
// import { User, UserRole } from '@/lib/types';

// interface HeaderProps {
//   currentUser: User;
//   onLogout: () => void;
//   onToggleMobileMenu?: () => void;
// }

// export default function Header({
//   currentUser,
//   onLogout,
//   onToggleMobileMenu,
// }: HeaderProps) {
//   const getRoleBadgeStyle = (role: UserRole) => {
//     switch (role) {
//       case 'admin':
//         return 'bg-purple-50 text-purple-700 border-purple-200';
//       case 'manager':
//         return 'bg-blue-50 text-blue-700 border-blue-200';
//       case 'support':
//         return 'bg-teal-50 text-teal-700 border-teal-200';
//       case 'accounts':
//         return 'bg-emerald-50 text-emerald-700 border-emerald-200';
//       default:
//         return 'bg-surface-container text-on-surface';
//     }
//   };

//   return (
//     <header className="fixed top-0 left-0 md:left-60 right-0 h-16 bg-surface-container-lowest border-b border-outline-variant/30 z-40 flex items-center justify-between px-3 sm:px-6 transition-all">
//       <div className="flex items-center gap-2 sm:gap-3">
//         {/* Mobile Hamburger Button */}
//         <button
//           type="button"
//           onClick={onToggleMobileMenu}
//           className="md:hidden p-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
//           title="Open Navigation Menu"
//           aria-label="Toggle navigation menu"
//         >
//           <span className="material-symbols-outlined text-xl">menu</span>
//         </button>

//         <div className="flex items-center gap-1.5 sm:gap-2">
//           <span className="text-xs text-secondary font-medium hidden sm:inline">ISP Console</span>
//           <span className="text-secondary hidden sm:inline">/</span>
//           <span className="text-xs font-semibold text-on-surface uppercase tracking-wide truncate max-w-[120px] sm:max-w-none">
//             {currentUser.role} Portal
//           </span>
//         </div>
//       </div>

//       <div className="flex items-center gap-2 sm:gap-4">
//         {/* User Role Tag */}
//         <span
//           className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeStyle(
//             currentUser.role
//           )}`}
//         >
//           {currentUser.role}
//         </span>

//         {/* User Name & Email */}
//         <div className="flex flex-col text-right">
//           <span className="text-xs font-semibold text-on-surface leading-tight truncate max-w-[110px] sm:max-w-none">
//             {currentUser.name}
//           </span>
//           <span className="text-[10px] sm:text-[11px] text-secondary font-mono leading-tight hidden xs:inline truncate max-w-[120px] sm:max-w-none">
//             {currentUser.user_id}
//           </span>
//         </div>

//         <div className="h-5 w-px bg-outline-variant/30 hidden xs:block" />

//         {/* Logout */}
//         <button
//           onClick={onLogout}
//           type="button"
//           className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-surface-container hover:bg-rose-50 hover:text-rose-600 text-secondary transition-colors text-xs font-medium cursor-pointer"
//           title="Sign Out"
//         >
//           <span className="material-symbols-outlined text-sm">logout</span>
//           <span className="hidden sm:inline">Sign Out</span>
//         </button>
//       </div>
//     </header>
//   );
// }



// =================2nd=====================with dark

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { User, UserRole } from '@/lib/types';

// interface HeaderProps {
//   currentUser: User;
//   onLogout: () => void;
//   onToggleMobileMenu?: () => void;
// }

// export default function Header({
//   currentUser,
//   onLogout,
//   onToggleMobileMenu,
// }: HeaderProps) {
//   const [theme, setTheme] = useState<'light' | 'dark'>('light');

//   useEffect(() => {
//     const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
//     if (savedTheme) {
//       setTheme(savedTheme);
//       document.documentElement.classList.toggle('dark', savedTheme === 'dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   }, []);

//   const toggleTheme = () => {
//     const nextTheme = theme === 'light' ? 'dark' : 'light';
//     setTheme(nextTheme);
//     localStorage.setItem('theme', nextTheme);

//     if (nextTheme === 'dark') {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   };

//   const getRoleBadgeStyle = (role: UserRole) => {
//     switch (role) {
//       case 'admin':
//         return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
//       case 'manager':
//         return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
//       case 'support':
//         return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800';
//       case 'accounts':
//         return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
//       default:
//         return 'bg-surface-container text-on-surface';
//     }
//   };

//   return (
//     <header className="fixed top-0 left-0 md:left-60 right-0 h-16 bg-surface-container-lowest border-b border-outline-variant/30 z-40 flex items-center justify-between px-3 sm:px-6 transition-all dark:bg-slate-900 dark:border-slate-800">
//       <div className="flex items-center gap-2 sm:gap-3">
//         {/* Mobile Hamburger Button */}
//         <button
//           type="button"
//           onClick={onToggleMobileMenu}
//           className="md:hidden p-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer dark:hover:bg-slate-800 dark:text-slate-300"
//           title="Open Navigation Menu"
//           aria-label="Toggle navigation menu"
//         >
//           <span className="material-symbols-outlined text-xl">menu</span>
//         </button>

//         <div className="flex items-center gap-1.5 sm:gap-2">
//           <span className="text-xs text-secondary font-medium hidden sm:inline dark:text-slate-400">
//             ISP Console
//           </span>
//           <span className="text-secondary hidden sm:inline dark:text-slate-500">/</span>
//           <span className="text-xs font-semibold text-on-surface uppercase tracking-wide truncate max-w-[120px] sm:max-w-none dark:text-slate-200">
//             {currentUser.role} Portal
//           </span>
//         </div>
//       </div>

//       <div className="flex items-center gap-2 sm:gap-2.5">
//         {/* User Role Tag */}
//         <span
//           className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeStyle(
//             currentUser.role
//           )}`}
//         >
//           {currentUser.role}
//         </span>

//         {/* User Name & Email */}
//         <div className="flex flex-col text-right">
//           <span className="text-xs font-semibold text-on-surface leading-tight truncate max-w-[110px] sm:max-w-none dark:text-slate-200">
//             {currentUser.name}
//           </span>
//           <span className="text-[10px] sm:text-[11px] text-secondary font-mono leading-tight hidden xs:inline truncate max-w-[120px] sm:max-w-none dark:text-slate-400">
//             {currentUser.user_id}
//           </span>
//         </div>

//         <div className="h-5 w-px bg-outline-variant/30 hidden xs:block dark:bg-slate-800" />

//         {/* Theme Switcher Button (Logout-এর মতো একই সাইজ ও ডিজাইন) */}
//         <button
//           type="button"
//           onClick={toggleTheme}
//           className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-surface-container hover:bg-amber-50 hover:text-amber-600 text-secondary transition-colors text-xs font-medium cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:hover:text-amber-400 dark:text-slate-300"
//           title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
//           aria-label="Toggle Theme"
//         >
//           <span className="material-symbols-outlined text-sm">
//             {theme === 'light' ? 'dark_mode' : 'light_mode'}
//           </span>
//           <span className="hidden sm:inline">
//             {theme === 'light' ? 'Dark' : 'Light'}
//           </span>
//         </button>

//         {/* Logout Button */}
//         <button
//           onClick={onLogout}
//           type="button"
//           className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-surface-container hover:bg-rose-50 hover:text-rose-600 text-secondary transition-colors text-xs font-medium cursor-pointer dark:bg-slate-800 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 dark:text-slate-300"
//           title="Sign Out"
//         >
//           <span className="material-symbols-outlined text-sm">logout</span>
//           <span className="hidden sm:inline">Sign Out</span>
//         </button>
//       </div>
//     </header>
//   );
// }




// =============framer transition ==================



'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserRole } from '@/lib/types';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  onToggleMobileMenu?: () => void;
}

export default function Header({
  currentUser,
  onLogout,
  onToggleMobileMenu,
}: HeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
      case 'support':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800';
      case 'accounts':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  return (
    <header className="fixed top-0 left-0 md:left-60 right-0 h-16 bg-surface-container-lowest border-b border-outline-variant/30 z-40 flex items-center justify-between px-3 sm:px-6 transition-all duration-300 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer dark:hover:bg-slate-800 dark:text-slate-300"
          title="Open Navigation Menu"
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs text-secondary font-medium hidden sm:inline dark:text-slate-400">
            ISP Console
          </span>
          <span className="text-secondary hidden sm:inline dark:text-slate-500">/</span>
          <span className="text-xs font-semibold text-on-surface uppercase tracking-wide truncate max-w-[120px] sm:max-w-none dark:text-slate-200">
            {currentUser.role} Portal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* User Role Tag */}
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeStyle(
            currentUser.role
          )}`}
        >
          {currentUser.role}
        </span>

        {/* User Name & Email */}
        <div className="flex flex-col text-right">
          <span className="text-xs font-semibold text-on-surface leading-tight truncate max-w-[110px] sm:max-w-none dark:text-slate-200">
            {currentUser.name}
          </span>
          <span className="text-[10px] sm:text-[11px] text-secondary font-mono leading-tight hidden xs:inline truncate max-w-[120px] sm:max-w-none dark:text-slate-400">
            {currentUser.user_id}
          </span>
        </div>

        <div className="h-5 w-px bg-outline-variant/30 hidden xs:block dark:bg-slate-800" />

        {/* Theme Switcher Button with Framer Motion */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-surface-container hover:bg-amber-50 hover:text-amber-600 text-secondary transition-colors text-xs font-medium cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:hover:text-amber-400 dark:text-slate-300 overflow-hidden"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle Theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ y: -12, opacity: 0, rotate: -45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 12, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.2 }}
              className="material-symbols-outlined text-sm block"
            >
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </motion.span>
          </AnimatePresence>

          <span className="hidden sm:inline">
            {theme === 'light' ? 'Dark' : 'Light'}
          </span>
        </motion.button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          type="button"
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-surface-container hover:bg-rose-50 hover:text-rose-600 text-secondary transition-colors text-xs font-medium cursor-pointer dark:bg-slate-800 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 dark:text-slate-300"
          title="Sign Out"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}