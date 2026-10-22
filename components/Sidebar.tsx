
// 'use client';
// import React from 'react';
// import Logo from './Logo';
// import { UserRole } from '@/lib/types';

// export type NavPath =
//   | 'dashboard'
//   | 'create-bill'
//   | 'pending-approval'
//   | 'approved-bills'
//   | 'user-management'
//   | 'client-info';

// interface SidebarProps {
//   currentPath: NavPath;
//   onNavigate: (path: NavPath) => void;
//   userRole: UserRole;
//   pendingCount?: number;
//   isMobileOpen?: boolean;
//   onCloseMobile?: () => void;
// }

// export default function Sidebar({
//   currentPath,
//   onNavigate,
//   userRole,
//   pendingCount = 0,
//   isMobileOpen = false,
//   onCloseMobile,
// }: SidebarProps) {
//   const getNavItems = () => {
//     switch (userRole) {
//       case 'admin':
//         return [
//           { id: 'dashboard' as NavPath, label: 'Dashboard', icon: 'dashboard' },
//           { id: 'create-bill' as NavPath, label: 'Create Bill', icon: 'receipt_long' },
//           {
//             id: 'pending-approval' as NavPath,
//             label: 'Pending Approval',
//             icon: 'pending_actions',
//             badge: pendingCount > 0 ? pendingCount : undefined,
//           },
//           { id: 'approved-bills' as NavPath, label: 'Approved Bills', icon: 'verified' },
//           { id: 'user-management' as NavPath, label: 'Staff Management', icon: 'admin_panel_settings' },
//           { id: 'client-info' as NavPath, label: 'Client Information', icon: 'contact_page' },
//         ];
//       case 'manager':
//         return [
//           { id: 'dashboard' as NavPath, label: 'Dashboard', icon: 'dashboard' },
//           {
//             id: 'pending-approval' as NavPath,
//             label: 'Pending Approval',
//             icon: 'pending_actions',
//             badge: pendingCount > 0 ? pendingCount : undefined,
//           },
//           { id: 'approved-bills' as NavPath, label: 'Approved Bills', icon: 'verified' },
//           { id: 'user-management' as NavPath, label: 'Support Staff', icon: 'badge' },
//           { id: 'client-info' as NavPath, label: 'Client Information', icon: 'contact_page' },
//         ];
//       case 'support':
//         return [
//           { id: 'create-bill' as NavPath, label: 'Create Bill', icon: 'receipt_long' },
//           { id: 'dashboard' as NavPath, label: 'Submitted Bills', icon: 'dashboard' },
//           { id: 'client-info' as NavPath, label: 'Client Information', icon: 'contact_page' },
//         ];
//       case 'accounts':
//         return [
//           { id: 'approved-bills' as NavPath, label: 'Approved & Ledger', icon: 'verified' },
//           { id: 'dashboard' as NavPath, label: 'Ledger Summary', icon: 'dashboard' },
//         ];
//       default:
//         return [];
//     }
//   };

//   const navItems = getNavItems();

//   const handleItemClick = (id: NavPath) => {
//     if (id === 'client-info') {
//       window.location.href = '/client-info';
//     } else {
//       onNavigate(id);
//     }
//     if (onCloseMobile) {
//       onCloseMobile();
//     }
//   };

//   return (
//     <>
//       {isMobileOpen && (
//         <div
//           onClick={onCloseMobile}
//           className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
//           aria-hidden="true"
//         />
//       )}

//       <aside
//         className={`fixed left-0 top-0 h-full w-60 bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
//           }`}
//       >
//         <div className="flex flex-col">
//           <div className="h-16 px-4 sm:px-5 flex items-center justify-between border-b border-outline-variant/20">
//             <div
//               onClick={() => window.location.reload()}
//               className="flex items-center cursor-pointer select-none"
//             >
//               {/* <Logo className="h-7 w-7" /> */}
//               <img
//                 src="/fnf-logo.png"
//                 alt="FnF Online Logo"
//                 className="h-20 w-20 object-contain"
//               />
//               <span className="font-bold text-base text-on-surface tracking-tight">
//                 FnF Online
//               </span>
//             </div>

//             <button
//               type="button"
//               onClick={onCloseMobile}
//               className="md:hidden p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
//               title="Close Menu"
//               aria-label="Close navigation menu"
//             >
//               <span className="material-symbols-outlined text-lg">close</span>
//             </button>
//           </div>

//           <div className="px-4 py-2 flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-secondary">
//             <span>Portal</span>
//             <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 font-bold border border-teal-200">
//               {userRole}
//             </span>
//           </div>

//           <nav className="flex flex-col gap-1 px-3 py-1">
//             {navItems.map((item) => {
//               const isActive = currentPath === item.id;

//               return (
//                 <button
//                   key={item.id}
//                   type="button"
//                   onClick={() => handleItemClick(item.id)}
//                   className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer ${isActive
//                     ? 'bg-teal-600 text-white font-semibold shadow-xs'
//                     : 'text-secondary hover:bg-surface-container hover:text-on-surface'
//                     }`}
//                 >
//                   <div className="flex items-center gap-2.5">
//                     <span className="material-symbols-outlined text-base">{item.icon}</span>
//                     <span>{item.label}</span>
//                   </div>

//                   {item.badge !== undefined && (
//                     <span
//                       className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white text-teal-800' : 'bg-amber-100 text-amber-800'
//                         }`}
//                     >
//                       {item.badge}
//                     </span>
//                   )}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         <div className="p-3 border-t border-outline-variant/20 text-[11px] text-secondary space-y-1.5">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-1.5">
//               <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
//               <span>Database Node</span>
//             </div>
//             <span className="text-[10px] font-mono text-secondary/80">Active</span>
//           </div>

//           {/* <div className="flex items-center gap-1 text-[10px] font-mono text-secondary/60 pt-1 border-t border-outline-variant/10">
//             <span>Developed by</span>
//             <a
//               href="https://kamrul-info.vercel.app/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-secondary/80 hover:text-teal-400 transition-colors underline-offset-2 hover:underline font-medium"
//             >
//               Kamrul Islam
//             </a>
//           </div> */}
//         </div>
//       </aside>
//     </>
//   );
// }





// ========2nd============



'use client';
import React, { useState } from 'react';
import Logo from './Logo';
import { UserRole } from '@/lib/types';


export type NavPath =
  | 'dashboard'
  | 'create-bill'
  | 'pending-approval'
  | 'approved-bills'
  | 'user-management'
  | 'client-info';

interface SidebarProps {
  currentPath: NavPath;
  onNavigate: (path: NavPath) => void;
  userRole: UserRole;
  pendingCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  currentPath,
  onNavigate,
  userRole,
  pendingCount = 0,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const getNavItems = () => {
    switch (userRole) {
      case 'admin':
        return [
          { id: 'dashboard' as NavPath, label: 'Dashboard', icon: 'dashboard' },
          { id: 'create-bill' as NavPath, label: 'Create Bill', icon: 'receipt_long' },
          {
            id: 'pending-approval' as NavPath,
            label: 'Pending Approval',
            icon: 'pending_actions',
            badge: pendingCount > 0 ? pendingCount : undefined,
          },
          { id: 'approved-bills' as NavPath, label: 'Approved Bills', icon: 'verified' },
          // নতুন Paid History মেনু আইটেম (Admin এর জন্য)
          { id: 'paid-history' as any, label: 'Paid History', icon: 'history_edu', isExternal: true, route: '/paid-history' },
          { id: 'user-management' as NavPath, label: 'Staff Management', icon: 'admin_panel_settings' },
          { id: 'client-info' as NavPath, label: 'Client Information', icon: 'contact_page' },
        ];
      case 'manager':
        return [
          { id: 'dashboard' as NavPath, label: 'Dashboard', icon: 'dashboard' },
          {
            id: 'pending-approval' as NavPath,
            label: 'Pending Approval',
            icon: 'pending_actions',
            badge: pendingCount > 0 ? pendingCount : undefined,
          },
          { id: 'approved-bills' as NavPath, label: 'Approved Bills', icon: 'verified' },
          { id: 'user-management' as NavPath, label: 'Support Staff', icon: 'badge' },
          { id: 'client-info' as NavPath, label: 'Client Information', icon: 'contact_page' },
        ];
      case 'support':
        return [
          { id: 'create-bill' as NavPath, label: 'Create Bill', icon: 'receipt_long' },
          { id: 'dashboard' as NavPath, label: 'Submitted Bills', icon: 'dashboard' },
          { id: 'client-info' as NavPath, label: 'Client Information', icon: 'contact_page' },
        ];
      case 'accounts':
        return [
          { id: 'approved-bills' as NavPath, label: 'Approved & Ledger', icon: 'verified' },
          // নতুন Paid History মেনু আইটেম (Accounts এর জন্য)
          { id: 'paid-history' as any, label: 'Paid History', icon: 'history_edu', isExternal: true, route: '/paid-history' },
          { id: 'dashboard' as NavPath, label: 'Ledger Summary', icon: 'dashboard' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleItemClick = (item: any) => {
    if (item.isExternal && item.route) {
      window.location.href = item.route;
    } else if (item.id === 'client-info') {
      window.location.href = '/client-info';
    } else {
      onNavigate(item.id);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <>
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-60 bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="flex flex-col">
          <div className="h-16 px-4 sm:px-5 flex items-center justify-between border-b border-outline-variant/20">

            {/* <div
              onClick={() => window.location.reload()}
              className="flex items-center cursor-pointer select-none"
            >
              <img
                src="/fnf-logo.png"
                alt="FnF Online Logo"
                className="h-20 w-20 object-contain"
              />
              <span className="font-bold text-base text-on-surface tracking-tight text-sm">
                First n Fast IT LTD
              </span>
            </div> */}

            <div
      onClick={() => window.location.reload()}
      className="flex items-center gap-2 cursor-pointer select-none"
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        {!imageLoaded && (
          <div className="absolute h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-teal-600" />
        )}

        <img
          src="/fnf-logo.png"
          alt="FnF Online Logo"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
          className={`h-20 w-20 object-contain transition-all duration-500 ${
            imageLoaded
              ? 'scale-100 opacity-100'
              : 'scale-90 opacity-0'
          }`}
        />
      </div>

      <span className="text-sm font-bold tracking-tight text-on-surface">
        First n Fast IT LTD
      </span>
    </div>


            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              title="Close Menu"
              aria-label="Close navigation menu"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <div className="px-4 py-2 flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-secondary">
            <span>Portal</span>
            <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 font-bold border border-teal-200">
              {userRole}
            </span>
          </div>

          <nav className="flex flex-col gap-1 px-3 py-1">
            {navItems.map((item: any) => {
              const isActive = currentPath === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer ${isActive
                    ? 'bg-teal-600 text-white font-semibold shadow-xs'
                    : 'text-secondary hover:bg-surface-container hover:text-on-surface'
                   }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white text-teal-800' : 'bg-amber-100 text-amber-800'
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-outline-variant/20 text-[11px] text-secondary space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Database Node</span>
            </div>
            <span className="text-[10px] font-mono text-secondary/80">Active</span>
          </div>
        </div>
      </aside>
    </>
  );
}