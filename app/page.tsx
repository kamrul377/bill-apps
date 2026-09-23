'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Sidebar, { NavPath } from '@/components/Sidebar';
import DashboardView from '@/components/DashboardView';
import CreateBillView from '@/components/CreateBillView';
import PendingApprovalView from '@/components/PendingApprovalView';
import ApprovedBillsView from '@/components/ApprovedBillsView';
import UserManagementView from '@/components/UserManagementView';
import LoginView from '@/components/LoginView';
import BillDetailModal from '@/components/BillDetailModal';
import BillVoucherModal from '@/components/BillVoucherModal';
import Toast, { ToastMessage } from '@/components/Toast';
import { Bill, DashboardStats, User } from '@/lib/types';

const INITIAL_ADMIN: User = {
  id: 1,
  user_id: 'kamrul.cse9@gmail.com',
  name: 'Kamrul Hasan',
  role: 'admin',
  created_at: '2026-01-01T00:00:00Z',
};

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('netbill_session_user');
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_ADMIN;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return !!sessionStorage.getItem('netbill_session_user');
      } catch {
        return false;
      }
    }
    return false;
  });

  const [currentPath, setCurrentPath] = useState<NavPath>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('netbill_session_user');
        if (saved) {
          const u = JSON.parse(saved);
          if (u.role === 'support') return 'create-bill';
          if (u.role === 'manager') return 'pending-approval';
          if (u.role === 'accounts') return 'approved-bills';
        }
      } catch {
        // fallback
      }
    }
    return 'dashboard';
  });

  const [bills, setBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBills: 0,
    pendingBills: 0,
    approvedBills: 0,
    rejectedBills: 0,
    totalVolumeTk: 0,
    pendingVolumeTk: 0,
    approvedVolumeTk: 0,
    rejectedVolumeTk: 0,
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Modals state
  const [detailModalBill, setDetailModalBill] = useState<Bill | null>(null);
  const [voucherModalBill, setVoucherModalBill] = useState<Bill | null>(null);

  // Fetch Bills & Stats
  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/bills');
      const data = await res.json();
      if (res.ok && data.bills) {
        setBills(data.bills);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load bills:', err);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch('/api/bills');
        const data = await res.json();
        if (!ignore && res.ok && data.bills) {
          setBills(data.bills);
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.error('Failed to load bills:', err);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Status Update Handler (Approve / Reject)
  const handleUpdateStatus = async (
    ticketId: string,
    status: 'Approved' | 'Rejected',
    reason?: string
  ) => {
    try {
      const res = await fetch(`/api/bills/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reason,
          approverName: `${currentUser.name} (${currentUser.role})`,
        }),
      });

      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  // Batch Approve Handler
  const handleBatchApprove = async (ticketIds: string[]) => {
    for (const ticketId of ticketIds) {
      await handleUpdateStatus(ticketId, 'Approved');
    }
    await loadData();
  };

  // New Bill Created Callback
  const handleBillCreated = (_newBill: Bill) => {
    loadData();
  };

  // Login handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    try {
      sessionStorage.setItem('netbill_session_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }

    if (user.role === 'support') {
      setCurrentPath('create-bill');
    } else if (user.role === 'manager') {
      setCurrentPath('pending-approval');
    } else if (user.role === 'accounts') {
      setCurrentPath('approved-bills');
    } else {
      setCurrentPath('dashboard');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    try {
      sessionStorage.removeItem('netbill_session_user');
    } catch (e) {
      console.error(e);
    }
    showToast('Signed out of console.', 'info');
  };

  // Enforce role-based path validation
  const handleNavigate = (path: NavPath) => {
    const role = currentUser.role;

    if (role === 'support' && (path === 'pending-approval' || path === 'approved-bills' || path === 'user-management')) {
      return;
    }
    if (role === 'accounts' && (path === 'create-bill' || path === 'pending-approval' || path === 'user-management')) {
      return;
    }
    if (role === 'manager' && path === 'create-bill') {
      return;
    }

    setCurrentPath(path);
  };

  if (!isLoggedIn) {
    return (
      <>
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          onShowToast={showToast}
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        userRole={currentUser.role}
        pendingCount={stats.pendingBills}
      />

      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="ml-60 mt-16 p-6 min-h-[calc(100vh-4rem)] flex flex-col">
        {currentPath === 'dashboard' && (
          <DashboardView
            bills={bills}
            stats={stats}
            currentUser={currentUser}
            onOpenCreateBill={() => setCurrentPath('create-bill')}
            onViewDetails={(bill) => setDetailModalBill(bill)}
          />
        )}

        {currentPath === 'create-bill' && (
          <CreateBillView
            currentUser={currentUser}
            recentBills={bills}
            onBillCreated={handleBillCreated}
            onNavigateToBills={() => setCurrentPath('dashboard')}
            onShowToast={showToast}
          />
        )}

        {currentPath === 'pending-approval' && (
          <PendingApprovalView
            bills={bills}
            currentUser={currentUser}
            onUpdateStatus={handleUpdateStatus}
            onBatchApprove={handleBatchApprove}
            onShowToast={showToast}
          />
        )}

        {currentPath === 'approved-bills' && (
          <ApprovedBillsView
            bills={bills}
            onViewDetails={(bill) => setDetailModalBill(bill)}
            onPrintSlip={(bill) => setVoucherModalBill(bill)}
            onShowToast={showToast}
          />
        )}

        {currentPath === 'user-management' && (
          <UserManagementView
            currentUser={currentUser}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Detail Modal */}
      <BillDetailModal
        bill={detailModalBill}
        isOpen={!!detailModalBill}
        onClose={() => setDetailModalBill(null)}
        onPrintVoucher={(bill) => {
          setDetailModalBill(null);
          setVoucherModalBill(bill);
        }}
      />

      {/* Voucher Slip Modal */}
      <BillVoucherModal
        bill={voucherModalBill}
        isOpen={!!voucherModalBill}
        onClose={() => setVoucherModalBill(null)}
      />

      {/* Global Animated Toasts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
