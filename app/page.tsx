


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

import { Bill, DashboardStats, User, Category } from '@/lib/types';

const INITIAL_STATS: DashboardStats = {
  totalBills: 0,
  pendingBills: 0,
  approvedBills: 0,
  paidBills: 0,
  rejectedBills: 0,
  totalVolumeTk: 0,
  pendingVolumeTk: 0,
  approvedVolumeTk: 0,
  paidVolumeTk: 0,
  rejectedVolumeTk: 0,
};

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // User is obtained from the server session, not sessionStorage.
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPath, setCurrentPath] =
    useState<NavPath>('dashboard');

  const [bills, setBills] = useState<Bill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [detailModalBill, setDetailModalBill] =
    useState<Bill | null>(null);
  const [voucherModalBill, setVoucherModalBill] =
    useState<Bill | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // =========================================================
  // MOUNT
  // =========================================================

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // =========================================================
  // VERIFY SESSION FROM SERVER
  // =========================================================

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
        });

        if (!response.ok) {
          if (active) {
            setCurrentUser(null);
            setIsLoggedIn(false);
          }
          return;
        }

        const data = await response.json();

        if (active && data.success && data.user) {
          setCurrentUser(data.user);
          setIsLoggedIn(true);

          if (data.user.role === 'support') {
            setCurrentPath('create-bill');
          } else if (data.user.role === 'manager') {
            setCurrentPath('pending-approval');
          } else if (data.user.role === 'accounts') {
            setCurrentPath('approved-bills');
          } else {
            setCurrentPath('dashboard');
          }
        } else if (active) {
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Session verification failed:', error);

        if (active) {
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, []);

  // =========================================================
  // TOAST
  // =========================================================

  const showToast = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'info' = 'info'
    ) => {
      const id = `${Date.now()} -${Math.random()} `;

      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) =>
          prev.filter((toast) => toast.id !== id)
        );
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.filter((toast) => toast.id !== id)
    );
  }, []);

  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories', {
        cache: 'no-store',
        credentials: 'same-origin',
      });

      if (res.ok) {
        const data = await res.json();
        setCategories(
          Array.isArray(data) ? data : data.categories || []
        );
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  // =========================================================
  // LOAD BILLS & STATS
  // =========================================================

  const loadData = useCallback(
    async (userOverride?: User) => {
      const userToQuery = userOverride || currentUser;

      if (!userToQuery) return;

      try {
        void loadCategories();

        // The API must derive identity and role from its
        // verified server-side session cookie.
        const res = await fetch('/api/bills', {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            setCurrentUser(null);
            setIsLoggedIn(false);
          }
          throw new Error(data?.error || 'Failed to load bills.');
        }

        if (data.bills) {
          setBills(data.bills);

          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch (error) {
        console.error('Failed to load bills:', error);
      }
    },
    [currentUser, loadCategories]
  );

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      void loadData();
    }
  }, [isLoggedIn, currentUser, loadData]);

  // =========================================================
  // CATEGORY CRUD
  // =========================================================

  const handleCreateCategory = async (name: string) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || data.message || 'Failed to create category'
        );
      }

      showToast('Category created successfully', 'success');
      await loadCategories();
      await loadData();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Error creating category',
        'error'
      );
    }
  };

  const handleUpdateCategory = async (
    id: number,
    name: string
  ) => {
    try {
      const res = await fetch(`/ api / categories / ${id} `, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || data.message || 'Failed to update category'
        );
      }

      showToast('Category updated successfully', 'success');
      await loadCategories();
      await loadData();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Error updating category',
        'error'
      );
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const res = await fetch(`/ api / categories / ${id} `, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || data.message || 'Failed to delete category'
        );
      }

      showToast('Category deleted successfully', 'success');
      await loadCategories();
      await loadData();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Error deleting category',
        'error'
      );
    }
  };

  // =========================================================
  // UPDATE BILL STATUS
  // =========================================================

  const handleUpdateStatus = async (
    billId: number,
    status: 'Approved' | 'Rejected',
    reason?: string,
    approvedAmount?: number
  ): Promise<void> => {
    if (!currentUser) return;

    try {
      const res = await fetch('/api/bills', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billIds: [Number(billId)],
          status,
          reason,
          approvedAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data?.error || data?.message || 'Failed to update bill status.'
        );
      }

      await loadData();

      showToast(
        status === 'Approved'
          ? approvedAmount !== undefined
            ? `Bill partially approved for ৳${approvedAmount.toLocaleString()} successfully.`
            : 'Bill approved successfully.'
          : 'Bill rejected successfully.',
        'success'
      );
    } catch (error) {
      console.error('Update status error:', error);

      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to update bill status.',
        'error'
      );

      throw error;
    }
  };

  // =========================================================
  // BATCH APPROVE
  // =========================================================

  const handleBatchApprove = async (
    billIds: number[]
  ): Promise<void> => {
    if (!currentUser) return;

    if (!billIds.length) {
      showToast('No bills selected.', 'info');
      return;
    }

    try {
      const res = await fetch('/api/bills', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billIds,
          status: 'Approved',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || data.message || 'Failed to approve bills batch'
        );
      }

      await loadData();

      showToast(
        `${billIds.length} bill(s) approved successfully.`,
        'success'
      );
    } catch (error) {
      console.error('Batch approve error:', error);
      showToast('Failed to approve bills in batch.', 'error');
      throw error;
    }
  };

  // =========================================================
  // PAY BILL
  // =========================================================

  const handlePayBill = async (
    billId: number,
    paymentDetails: {
      paymentMethod: string;
      paymentNote?: string;
      paidBy?: string;
    }
  ): Promise<void> => {
    if (!currentUser) return;

    try {
      const res = await fetch(`/api/bills/${Number(billId)} `, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Paid',
          paymentMethod: paymentDetails.paymentMethod,
          paymentNote: paymentDetails.paymentNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || data?.message || 'Failed to process payment.'
        );
      }

      await loadData();

      showToast('Bill payment completed successfully.', 'success');
    } catch (error) {
      console.error('Payment processing error:', error);

      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to process payment.',
        'error'
      );

      throw error;
    }
  };

  // =========================================================
  // BATCH PAY
  // =========================================================

  const handleBatchPayBills = async (
    billIds: number[],
    paymentDetails: {
      paymentMethod: string;
      paymentNote?: string;
      paidBy?: string;
    }
  ): Promise<void> => {
    if (!currentUser) return;

    if (!billIds.length) {
      showToast('No bills selected.', 'info');
      return;
    }

    try {
      const res = await fetch('/api/bills', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billIds,
          status: 'Paid',
          paymentMethod: paymentDetails.paymentMethod || 'Cash',
          paymentNote: paymentDetails.paymentNote || '',
        }),
      });

      const textData = await res.text();

      let data: any;
      try {
        data = textData ? JSON.parse(textData) : {};
      } catch {
        throw new Error(
          `Server response error(${res.status}): ${textData} `
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || data.message || 'Failed to process batch payment.'
        );
      }

      await loadData();

      showToast(
        `${billIds.length} bill(s) paid successfully.`,
        'success'
      );
    } catch (error) {
      console.error('Batch payment error:', error);

      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to pay bills in batch.',
        'error'
      );

      throw error;
    }
  };

  // =========================================================
  // BILL CREATED
  // =========================================================

  const handleBillCreated = (_newBill: Bill) => {
    void loadData();
  };

  // =========================================================
  // LOGIN SUCCESS
  // =========================================================

  const handleLoginSuccess = (user: User) => {
    // LoginView must call the login API first, and the API
    // must set the HttpOnly session cookie.
    setCurrentUser(user);
    setIsLoggedIn(true);

    if (user.role === 'support') {
      setCurrentPath('create-bill');
    } else if (user.role === 'manager') {
      setCurrentPath('pending-approval');
    } else if (user.role === 'accounts') {
      setCurrentPath('approved-bills');
    } else {
      setCurrentPath('dashboard');
    }

    void loadData(user);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (!res.ok) {
        console.error('Server logout returned:', res.status);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setCurrentUser(null);
      setIsLoggedIn(false);
      setBills([]);
      setCategories([]);
      setStats(INITIAL_STATS);
      setCurrentPath('dashboard');

      // Remove old client-side session data if it exists.
      try {
        sessionStorage.removeItem('netbill_session_user');
      } catch {
        // Ignore storage errors.
      }

      showToast('Signed out of console.', 'info');
    }
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleNavigate = (path: NavPath) => {
    if (!currentUser) return;

    const role = currentUser.role;

    if (
      role === 'support' &&
      (
        path === 'pending-approval' ||
        path === 'approved-bills' ||
        path === 'user-management'
      )
    ) {
      return;
    }

    if (
      role === 'accounts' &&
      (
        path === 'create-bill' ||
        path === 'pending-approval' ||
        path === 'user-management'
      )
    ) {
      return;
    }

    if (role === 'manager' && path === 'create-bill') {
      return;
    }

    setCurrentPath(path);
  };

  // =========================================================
  // LOADING / AUTH CHECK
  // =========================================================

  if (!isMounted || authLoading) {
    return null;
  }

  if (!isLoggedIn || !currentUser) {
    return (
      <>
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          onShowToast={showToast}
        />
        <Toast
          toasts={toasts}
          onDismiss={dismissToast}
        />
      </>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface">
      <Sidebar
        currentPath={currentPath}
        onNavigate={(path) => {
          handleNavigate(path);
          setIsMobileMenuOpen(false);
        }}
        userRole={currentUser.role}
        pendingCount={stats.pendingBills}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onToggleMobileMenu={() =>
          setIsMobileMenuOpen((prev) => !prev)
        }
      />

      <main className="md:ml-60 ml-0 mt-16 p-3 sm:p-5 md:p-6 min-h-[calc(100vh-4rem)] flex flex-col transition-all">
        {currentPath === 'dashboard' && (
          <DashboardView
            bills={bills}
            stats={stats}
            currentUser={currentUser}
            categories={categories}
            onCreateCategory={handleCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
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
            categories={categories}
          />
        )}

        {currentPath === 'approved-bills' && (
          <ApprovedBillsView
            bills={bills}
            currentUser={currentUser}
            onViewDetails={(bill) => setDetailModalBill(bill)}
            onPrintSlip={(bill) => setVoucherModalBill(bill)}
            onPayBill={handlePayBill}
            onBatchPayBills={handleBatchPayBills}
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

      <BillDetailModal
        bill={detailModalBill}
        isOpen={!!detailModalBill}
        onClose={() => setDetailModalBill(null)}
        onPrintVoucher={(bill) => {
          setDetailModalBill(null);
          setVoucherModalBill(bill);
        }}
      />

      <BillVoucherModal
        bill={voucherModalBill}
        isOpen={!!voucherModalBill}
        onClose={() => setVoucherModalBill(null)}
      />

      <Toast
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </div>
  );
}
