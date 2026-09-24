'use client';

import React from 'react';
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
  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'support':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'accounts':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  return (
    <header className="fixed top-0 left-0 md:left-60 right-0 h-16 bg-surface-container-lowest border-b border-outline-variant/30 z-40 flex items-center justify-between px-3 sm:px-6 transition-all">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          title="Open Navigation Menu"
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs text-secondary font-medium hidden sm:inline">ISP Console</span>
          <span className="text-secondary hidden sm:inline">/</span>
          <span className="text-xs font-semibold text-on-surface uppercase tracking-wide truncate max-w-[120px] sm:max-w-none">
            {currentUser.role} Portal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
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
          <span className="text-xs font-semibold text-on-surface leading-tight truncate max-w-[110px] sm:max-w-none">
            {currentUser.name}
          </span>
          <span className="text-[10px] sm:text-[11px] text-secondary font-mono leading-tight hidden xs:inline truncate max-w-[120px] sm:max-w-none">
            {currentUser.user_id}
          </span>
        </div>

        <div className="h-5 w-px bg-outline-variant/30 hidden xs:block" />

        {/* Logout */}
        <button
          onClick={onLogout}
          type="button"
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-surface-container hover:bg-rose-50 hover:text-rose-600 text-secondary transition-colors text-xs font-medium cursor-pointer"
          title="Sign Out"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
