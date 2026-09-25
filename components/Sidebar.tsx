'use client';

import React from 'react';
import Logo from './Logo';
import { UserRole } from '@/lib/types';

export type NavPath = 'dashboard' | 'create-bill' | 'pending-approval' | 'approved-bills' | 'user-management';

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
          { id: 'user-management' as NavPath, label: 'Staff Management', icon: 'admin_panel_settings' },
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
        ];
      case 'support':
        return [
          { id: 'create-bill' as NavPath, label: 'Create Bill', icon: 'receipt_long' },
          { id: 'dashboard' as NavPath, label: 'Submitted Bills', icon: 'dashboard' },
        ];
      case 'accounts':
        return [
          { id: 'approved-bills' as NavPath, label: 'Approved & Ledger', icon: 'verified' },
          { id: 'dashboard' as NavPath, label: 'Ledger Summary', icon: 'dashboard' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleItemClick = (id: NavPath) => {
    onNavigate(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-60 bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-4 sm:px-5 flex items-center justify-between border-b border-outline-variant/20">
            <div className="flex items-center gap-2.5">
              <Logo className="h-7 w-7" />
              <span className="font-bold text-base text-on-surface tracking-tight">
                FnF Online
              </span>
            </div>

            {/* Mobile close button */}
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

          {/* Role badge */}
          <div className="px-4 py-2 flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-secondary">
            <span>Portal</span>
            <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 font-bold border border-teal-200">
              {userRole}
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1 px-3 py-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
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

        {/* Minimal Footer */}


        <div className="p-3 border-t border-outline-variant/20 text-[11px] text-secondary flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Database Node</span>
          </div>
          <span className="text-[10px] font-mono text-secondary/80">Active</span>
        </div>
      </aside>
    </>
  );
}
