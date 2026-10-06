// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import Header from '@/components/Header';
// import Sidebar, { NavPath } from '@/components/Sidebar';
// import DashboardView from '@/components/DashboardView';
// import CreateBillView from '@/components/CreateBillView';
// import PendingApprovalView from '@/components/PendingApprovalView';
// import ApprovedBillsView from '@/components/ApprovedBillsView';
// import UserManagementView from '@/components/UserManagementView';
// import LoginView from '@/components/LoginView';
// import BillDetailModal from '@/components/BillDetailModal';
// import BillVoucherModal from '@/components/BillVoucherModal';
// import Toast, { ToastMessage } from '@/components/Toast';
// import { Bill, DashboardStats, User } from '@/lib/types';

// const INITIAL_ADMIN: User = {
//   id: 1,
//   user_id: 'kamrul.cse9@gmail.com',
//   name: 'Kamrul Hasan',
//   role: 'admin',
//   created_at: '2026-01-01T00:00:00Z',
// };

// export default function Home() {

//   const [isMounted, setIsMounted] = useState(false);




//   const [currentUser, setCurrentUser] = useState<User>(() => {
//     if (typeof window !== 'undefined') {
//       try {
//         const saved = sessionStorage.getItem('netbill_session_user');
//         if (saved) return JSON.parse(saved);
//       } catch {
//         // fallback
//       }
//     }
//     return INITIAL_ADMIN;
//   });

//   const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
//     if (typeof window !== 'undefined') {
//       try {
//         return !!sessionStorage.getItem('netbill_session_user');
//       } catch {
//         return false;
//       }
//     }
//     return false;
//   });

//   const [currentPath, setCurrentPath] = useState<NavPath>(() => {
//     if (typeof window !== 'undefined') {
//       try {
//         const saved = sessionStorage.getItem('netbill_session_user');
//         if (saved) {
//           const u = JSON.parse(saved);
//           if (u.role === 'support') return 'create-bill';
//           if (u.role === 'manager') return 'pending-approval';
//           if (u.role === 'accounts') return 'approved-bills';
//         }
//       } catch {
//         // fallback
//       }
//     }
//     return 'dashboard';
//   });

//   const [bills, setBills] = useState<Bill[]>([]);
//   const [stats, setStats] = useState<DashboardStats>({
//     totalBills: 0,
//     pendingBills: 0,
//     approvedBills: 0,
//     paidBills: 0,
//     rejectedBills: 0,
//     totalVolumeTk: 0,
//     pendingVolumeTk: 0,
//     approvedVolumeTk: 0,
//     paidVolumeTk: 0,
//     rejectedVolumeTk: 0,
//   });





//   // Toasts
//   const [toasts, setToasts] = useState<ToastMessage[]>([]);

//   const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
//     const id = `${Date.now()}-${Math.random()}`;
//     setToasts((prev) => [...prev, { id, message, type }]);
//     setTimeout(() => {
//       setToasts((prev) => prev.filter((t) => t.id !== id));
//     }, 4000);
//   }, []);

//   const dismissToast = useCallback((id: string) => {
//     setToasts((prev) => prev.filter((t) => t.id !== id));
//   }, []);

//   // Modals state
//   const [detailModalBill, setDetailModalBill] = useState<Bill | null>(null);
//   const [voucherModalBill, setVoucherModalBill] = useState<Bill | null>(null);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // Fetch Bills & Stats (Support sees only their own bills & TK, Admin/Manager/Accounts see all)
//   const loadData = useCallback(async (userOverride?: User) => {
//     const userToQuery = userOverride || currentUser;
//     if (!userToQuery) return;

//     try {
//       const params = new URLSearchParams();
//       if (userToQuery.role) params.set('role', userToQuery.role);
//       if (userToQuery.user_id) params.set('userId', userToQuery.user_id);
//       if (userToQuery.name) params.set('userName', userToQuery.name);

//       const res = await fetch(`/api/bills?${params.toString()}`);
//       const data = await res.json();
//       if (res.ok && data.bills) {
//         setBills(data.bills);
//         if (data.stats) {
//           setStats(data.stats);
//         }
//       }
//     } catch (err) {
//       console.error('Failed to load bills:', err);
//     }
//   }, [currentUser]);

//   useEffect(() => {
//     loadData();
//   }, [loadData]);

//   // Status Update Handler (Approve / Reject)
//   const handleUpdateStatus = async (
//     ticketId: string,
//     status: 'Approved' | 'Rejected',
//     reason?: string
//   ) => {
//     try {
//       const res = await fetch(`/api/bills/${ticketId}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           status,
//           reason,
//           approverName: `${currentUser.name} (${currentUser.role})`,
//         }),
//       });

//       if (res.ok) {
//         await loadData();
//       }
//     } catch (err) {
//       console.error('Update status error:', err);
//     }
//   };


//   //mound issue solved....
//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   // ব্রাউজারে পুরোপুরি মাউন্ট হওয়ার আগে রেন্ডার প্রতিরোধ করবে
//   if (!isMounted) {
//     return null; // অথবা একটি Simple Loader Component দিতে পারেন
//   }

//   // Batch Approve Handler
//   const handleBatchApprove = async (ticketIds: string[]) => {
//     for (const ticketId of ticketIds) {
//       await handleUpdateStatus(ticketId, 'Approved');
//     }
//     await loadData();
//   };

//   // Payment Handler (Accounts)
//   const handlePayBill = async (
//     ticketId: string,
//     paymentDetails: { paymentMethod: string; paymentNote?: string; paidBy?: string }
//   ) => {
//     try {
//       const res = await fetch(`/api/bills/${ticketId}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           status: 'Paid',
//           paymentMethod: paymentDetails.paymentMethod,
//           paymentNote: paymentDetails.paymentNote,
//           paidBy: paymentDetails.paidBy || `${currentUser.name} (${currentUser.role})`,
//         }),
//       });

//       if (res.ok) {
//         await loadData();
//       }
//     } catch (err) {
//       console.error('Payment processing error:', err);
//     }
//   };

//   // Batch Pay Handler (Accounts)
//   const handleBatchPayBills = async (
//     ticketIds: string[],
//     paymentDetails: { paymentMethod: string; paymentNote?: string; paidBy?: string }
//   ) => {
//     for (const ticketId of ticketIds) {
//       await handlePayBill(ticketId, paymentDetails);
//     }
//     await loadData();
//   };

//   // New Bill Created Callback
//   const handleBillCreated = (_newBill: Bill) => {
//     loadData();
//   };

//   // Login handler
//   const handleLoginSuccess = (user: User) => {
//     setCurrentUser(user);
//     setIsLoggedIn(true);
//     try {
//       sessionStorage.setItem('netbill_session_user', JSON.stringify(user));
//     } catch (e) {
//       console.error(e);
//     }
//     loadData(user);

//     if (user.role === 'support') {
//       setCurrentPath('create-bill');
//     } else if (user.role === 'manager') {
//       setCurrentPath('pending-approval');
//     } else if (user.role === 'accounts') {
//       setCurrentPath('approved-bills');
//     } else {
//       setCurrentPath('dashboard');
//     }
//   };

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     try {
//       sessionStorage.removeItem('netbill_session_user');
//     } catch (e) {
//       console.error(e);
//     }
//     setBills([]);
//     setStats({
//       totalBills: 0,
//       pendingBills: 0,
//       approvedBills: 0,
//       paidBills: 0,
//       rejectedBills: 0,
//       totalVolumeTk: 0,
//       pendingVolumeTk: 0,
//       approvedVolumeTk: 0,
//       paidVolumeTk: 0,
//       rejectedVolumeTk: 0,
//     });
//     showToast('Signed out of console.', 'info');
//   };

//   // Enforce role-based path validation
//   const handleNavigate = (path: NavPath) => {
//     const role = currentUser.role;

//     if (role === 'support' && (path === 'pending-approval' || path === 'approved-bills' || path === 'user-management')) {
//       return;
//     }
//     if (role === 'accounts' && (path === 'create-bill' || path === 'pending-approval' || path === 'user-management')) {
//       return;
//     }
//     if (role === 'manager' && path === 'create-bill') {
//       return;
//     }

//     setCurrentPath(path);
//   };

//   if (!isLoggedIn) {
//     return (
//       <>
//         <LoginView
//           onLoginSuccess={handleLoginSuccess}
//           onShowToast={showToast}
//         />
//         <Toast toasts={toasts} onDismiss={dismissToast} />
//       </>
//     );
//   }




//   return (
//     <div className="min-h-screen bg-surface-container-low text-on-surface">
//       {/* Sidebar Navigation */}
//       <Sidebar
//         currentPath={currentPath}
//         onNavigate={(path) => {
//           handleNavigate(path);
//           setIsMobileMenuOpen(false);
//         }}
//         userRole={currentUser.role}
//         pendingCount={stats.pendingBills}
//         isMobileOpen={isMobileMenuOpen}
//         onCloseMobile={() => setIsMobileMenuOpen(false)}
//       />

//       {/* Top Header */}
//       <Header
//         currentUser={currentUser}
//         onLogout={handleLogout}
//         onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
//       />

//       {/* Main Content Area - Responsive layout */}
//       <main className="md:ml-60 ml-0 mt-16 p-3 sm:p-5 md:p-6 min-h-[calc(100vh-4rem)] flex flex-col transition-all">
//         {currentPath === 'dashboard' && (
//           <DashboardView
//             bills={bills}
//             stats={stats}
//             currentUser={currentUser}
//             onOpenCreateBill={() => setCurrentPath('create-bill')}
//             onViewDetails={(bill) => setDetailModalBill(bill)}
//           />
//         )}

//         {currentPath === 'create-bill' && (
//           <CreateBillView
//             currentUser={currentUser}
//             recentBills={bills}
//             onBillCreated={handleBillCreated}
//             onNavigateToBills={() => setCurrentPath('dashboard')}
//             onShowToast={showToast}
//           />
//         )}

//         {currentPath === 'pending-approval' && (
//           <PendingApprovalView
//             bills={bills}
//             currentUser={currentUser}
//             onUpdateStatus={handleUpdateStatus}
//             onBatchApprove={handleBatchApprove}
//             onShowToast={showToast}
//           />
//         )}

//         {currentPath === 'approved-bills' && (
//           <ApprovedBillsView
//             bills={bills}
//             currentUser={currentUser}
//             onViewDetails={(bill) => setDetailModalBill(bill)}
//             onPrintSlip={(bill) => setVoucherModalBill(bill)}
//             onPayBill={handlePayBill}
//             onBatchPayBills={handleBatchPayBills}
//             onShowToast={showToast}
//           />
//         )}

//         {currentPath === 'user-management' && (
//           <UserManagementView
//             currentUser={currentUser}
//             onShowToast={showToast}
//           />
//         )}
//       </main>

//       {/* Detail Modal */}
//       <BillDetailModal
//         bill={detailModalBill}
//         isOpen={!!detailModalBill}
//         onClose={() => setDetailModalBill(null)}
//         onPrintVoucher={(bill) => {
//           setDetailModalBill(null);
//           setVoucherModalBill(bill);
//         }}
//       />

//       {/* Voucher Slip Modal */}
//       <BillVoucherModal
//         bill={voucherModalBill}
//         isOpen={!!voucherModalBill}
//         onClose={() => setVoucherModalBill(null)}
//       />

//       {/* Global Animated Toasts */}
//       <Toast toasts={toasts} onDismiss={dismissToast} />
//     </div>
//   );
// }

// ==========================2nd =====================


'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';


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
import { useRouter } from 'next/navigation';

import { Bill, DashboardStats, User } from '@/lib/types';

const INITIAL_ADMIN: User = {
  id: 1,
  user_id: 'kamrul.cse9@gmail.com',
  name: 'Kamrul Hasan',
  role: 'admin',
  created_at: '2026-01-01T00:00:00Z',
};

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
          const user = JSON.parse(saved);

          if (user.role === 'support') return 'create-bill';
          if (user.role === 'manager') return 'pending-approval';
          if (user.role === 'accounts') return 'approved-bills';
        }
      } catch {
        // fallback
      }
    }

    return 'dashboard';
  });

  const [bills, setBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [detailModalBill, setDetailModalBill] =
    useState<Bill | null>(null);

  const [voucherModalBill, setVoucherModalBill] =
    useState<Bill | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  // =========================================================
  // TOAST
  // =========================================================

  const showToast = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'info' = 'info'
    ) => {
      const id = `${Date.now()}-${Math.random()}`;

      setToasts((prev) => [
        ...prev,
        { id, message, type },
      ]);

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
  // LOAD DATA
  // =========================================================

  const loadData = useCallback(
    async (userOverride?: User) => {
      const userToQuery = userOverride || currentUser;

      if (!userToQuery) return;

      try {
        const params = new URLSearchParams();

        if (userToQuery.role) {
          params.set('role', userToQuery.role);
        }

        if (userToQuery.user_id) {
          params.set('userId', userToQuery.user_id);
        }

        if (userToQuery.name) {
          params.set('userName', userToQuery.name);
        }

        const res = await fetch(
          `/api/bills?${params.toString()}`,
          {
            cache: 'no-store',
          }
        );

        const data = await res.json();

        if (res.ok && data.bills) {
          setBills(data.bills);

          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch (error) {
        console.error('Failed to load bills:', error);
      }
    },
    [currentUser]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // =========================================================
  // APPROVE / REJECT
  // BILL ID IS USED, NOT TICKET ID
  // =========================================================

  const handleUpdateStatus = async (
    billId: number,
    status: 'Approved' | 'Rejected',
    reason?: string
  ): Promise<void> => {
    try {
      const res = await fetch(`/api/bills/${Number(billId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          reason,
          approverName: `${currentUser.name} (${currentUser.role})`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || 'Failed to update bill status.'
        );
      }

      await loadData();

      showToast(
        status === 'Approved'
          ? 'Bill approved successfully.'
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
    if (!billIds.length) {
      showToast('No bills selected.', 'info');
      return;
    }

    try {
      for (const billId of billIds) {
        await handleUpdateStatus(
          Number(billId),
          'Approved'
        );
      }

      await loadData();

      showToast(
        `${billIds.length} bill(s) approved successfully.`,
        'success'
      );
    } catch (error) {
      console.error('Batch approve error:', error);

      throw error;
    }
  };

  // =========================================================
  // PAY BILL
  // BILL ID IS USED, NOT TICKET ID
  // =========================================================

  const handlePayBill = async (
    billId: number,
    paymentDetails: {
      paymentMethod: string;
      paymentNote?: string;
      paidBy?: string;
    }
  ): Promise<void> => {
    try {
      const res = await fetch(`/api/bills/${Number(billId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Paid',
          paymentMethod: paymentDetails.paymentMethod,
          paymentNote: paymentDetails.paymentNote,
          paidBy:
            paymentDetails.paidBy ||
            `${currentUser.name} (${currentUser.role})`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || 'Failed to process payment.'
        );
      }

      await loadData();

      showToast(
        'Bill payment completed successfully.',
        'success'
      );
    } catch (error) {
      console.error(
        'Payment processing error:',
        error
      );

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
    if (!billIds.length) {
      showToast('No bills selected.', 'info');
      return;
    }

    try {
      for (const billId of billIds) {
        await handlePayBill(
          Number(billId),
          paymentDetails
        );
      }

      await loadData();

      showToast(
        `${billIds.length} bill(s) paid successfully.`,
        'success'
      );
    } catch (error) {
      console.error(
        'Batch payment error:',
        error
      );

      throw error;
    }
  };

  // =========================================================
  // BILL CREATED
  // =========================================================

  const handleBillCreated = (_newBill: Bill) => {
    loadData();
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);

    try {
      sessionStorage.setItem(
        'netbill_session_user',
        JSON.stringify(user)
      );
    } catch (error) {
      console.error(error);
    }

    loadData(user);

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

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    setIsLoggedIn(false);

    try {
      sessionStorage.removeItem(
        'netbill_session_user'
      );
    } catch (error) {
      console.error(error);
    }

    setBills([]);
    setStats(INITIAL_STATS);

    showToast(
      'Signed out of console.',
      'info'
    );
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleNavigate = (path: NavPath) => {
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

    if (
      role === 'manager' &&
      path === 'create-bill'
    ) {
      return;
    }

    setCurrentPath(path);
  };

  // =========================================================
  // MOUNT
  // =========================================================

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // =========================================================
  // LOGIN
  // =========================================================

  if (!isLoggedIn) {
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

      {/* Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={(path) => {
          handleNavigate(path);
          setIsMobileMenuOpen(false);
        }}
        userRole={currentUser.role}
        pendingCount={stats.pendingBills}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() =>
          setIsMobileMenuOpen(false)
        }
      />

      {/* Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onToggleMobileMenu={() =>
          setIsMobileMenuOpen((prev) => !prev)
        }
      />

      {/* Main Content */}
      <main className="md:ml-60 ml-0 mt-16 p-3 sm:p-5 md:p-6 min-h-[calc(100vh-4rem)] flex flex-col transition-all">

        {/* Dashboard */}
        {currentPath === 'dashboard' && (
          <DashboardView
            bills={bills}
            stats={stats}
            currentUser={currentUser}
            onOpenCreateBill={() =>
              setCurrentPath('create-bill')
            }
            onViewDetails={(bill) =>
              setDetailModalBill(bill)
            }
          />
        )}

        {/* Create Bill */}
        {currentPath === 'create-bill' && (
          <CreateBillView
            currentUser={currentUser}
            recentBills={bills}
            onBillCreated={handleBillCreated}
            onNavigateToBills={() =>
              setCurrentPath('dashboard')
            }
            onShowToast={showToast}
          />
        )}

        {/* Pending Approval */}
        {currentPath === 'pending-approval' && (
          <PendingApprovalView
            bills={bills}
            currentUser={currentUser}
            onUpdateStatus={handleUpdateStatus}
            onBatchApprove={handleBatchApprove}
            onShowToast={showToast}
          />
        )}

        {/* Approved Bills */}
        {currentPath === 'approved-bills' && (
          <ApprovedBillsView
            bills={bills}
            currentUser={currentUser}
            onViewDetails={(bill) =>
              setDetailModalBill(bill)
            }
            onPrintSlip={(bill) =>
              setVoucherModalBill(bill)
            }
            onPayBill={handlePayBill}
            onBatchPayBills={handleBatchPayBills}
            onShowToast={showToast}
          />
        )}

        {/* User Management */}
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
        onClose={() =>
          setDetailModalBill(null)
        }
        onPrintVoucher={(bill) => {
          setDetailModalBill(null);
          setVoucherModalBill(bill);
        }}
      />

      {/* Voucher Modal */}
      <BillVoucherModal
        bill={voucherModalBill}
        isOpen={!!voucherModalBill}
        onClose={() =>
          setVoucherModalBill(null)
        }
      />

      {/* Toast */}
      <Toast
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </div>
  );
}




// ======================3rddd===============================================

// 'use client';

// import React, { useEffect, useMemo, useState } from 'react';
// import { useRouter } from 'next/navigation';

// type ClientStatus = 'Connected' | 'Disconnected';

// interface POC {
//   id: number | string;
//   name: string;
//   phone?: string | null;
//   designation?: string | null;
//   createdAt?: string;
// }

// interface Client {
//   id: number | string;
//   clientId: string;
//   clientName: string;
//   clientPhone?: string | null;

//   primaryIp?: string | null;
//   primaryOnu?: string | null;

//   secondaryIp?: string | null;
//   secondaryOnu?: string | null;

//   location?: string | null;

//   pocId?: number | string | null;
//   pocName?: string | null;

//   status: ClientStatus;

//   description?: string | null;

//   createdAt?: string | null;
//   updatedAt?: string | null;
// }

// interface ClientForm {
//   clientId: string;
//   clientName: string;
//   clientPhone: string;
//   primaryIp: string;
//   primaryOnu: string;
//   secondaryIp: string;
//   secondaryOnu: string;
//   location: string;
//   pocId: string;
//   status: ClientStatus;
//   description: string;
// }

// interface POCForm {
//   name: string;
// }

// type ToastType = 'success' | 'error' | 'edit' | 'delete';

// interface ToastItem {
//   id: number;
//   message: string;
//   type: ToastType;
// }

// const EMPTY_CLIENT_FORM: ClientForm = {
//   clientId: '',
//   clientName: '',
//   clientPhone: '',
//   primaryIp: '',
//   primaryOnu: '',
//   secondaryIp: '',
//   secondaryOnu: '',
//   location: '',
//   pocId: '',
//   status: 'Connected',
//   description: '',
// };

// const EMPTY_POC_FORM: POCForm = {
//   name: '',
// };

// export default function ClientInfoPage() {
//   const router = useRouter();

//   // =========================================================
//   // AUTHENTICATION
//   // =========================================================

//   const [authChecking, setAuthChecking] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const checkAuthentication = () => {
//       try {
//         const savedUser = sessionStorage.getItem('netbill_session_user');

//         if (!savedUser) {
//           setIsAuthenticated(false);
//           router.replace('/');
//           return;
//         }

//         // Validate JSON
//         JSON.parse(savedUser);

//         setIsAuthenticated(true);
//         setAuthChecking(false);
//       } catch (error) {
//         console.error('Authentication check failed:', error);

//         setIsAuthenticated(false);
//         sessionStorage.removeItem('netbill_session_user');
//         router.replace('/');
//       }
//     };

//     checkAuthentication();
//   }, [router]);

//   // =========================================================
//   // STATES
//   // =========================================================

//   const [clients, setClients] = useState<Client[]>([]);
//   const [pocs, setPocs] = useState<POC[]>([]);

//   const [loading, setLoading] = useState(true);

//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState<'All' | ClientStatus>(
//     'All'
//   );
//   const [pocFilter, setPocFilter] = useState('All');

//   const [sortBy, setSortBy] = useState<
//     'newest' | 'oldest' | 'name' | 'clientId'
//   >('newest');

//   const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   // Client modal
//   const [isClientModalOpen, setIsClientModalOpen] = useState(false);
//   const [editingClient, setEditingClient] = useState<Client | null>(null);
//   const [clientForm, setClientForm] =
//     useState<ClientForm>(EMPTY_CLIENT_FORM);

//   // Client delete
//   const [deleteClientTargetId, setDeleteClientTargetId] = useState<
//     number | string | null
//   >(null);

//   // Client details
//   const [selectedClient, setSelectedClient] = useState<Client | null>(null);

//   // POC management
//   const [isPocManagementOpen, setIsPocManagementOpen] = useState(false);

//   // POC add/edit
//   const [isPocModalOpen, setIsPocModalOpen] = useState(false);
//   const [editingPoc, setEditingPoc] = useState<POC | null>(null);
//   const [pocForm, setPocForm] = useState<POCForm>(EMPTY_POC_FORM);

//   // POC delete
//   const [deletePocTargetId, setDeletePocTargetId] = useState<
//     number | string | null
//   >(null);

//   // Toast
//   const [toasts, setToasts] = useState<ToastItem[]>([]);

//   // =========================================================
//   // TOAST
//   // =========================================================

//   const showToast = (
//     message: string,
//     type: ToastType = 'success'
//   ) => {
//     const id = Date.now() + Math.random();

//     setToasts((prev) => [
//       ...prev,
//       {
//         id,
//         message,
//         type,
//       },
//     ]);

//     setTimeout(() => {
//       setToasts((prev) => prev.filter((toast) => toast.id !== id));
//     }, 3500);
//   };

//   const removeToast = (id: number) => {
//     setToasts((prev) => prev.filter((toast) => toast.id !== id));
//   };

//   // =========================================================
//   // NORMALIZE DATA
//   // =========================================================

//   const normalizePoc = (item: any): POC => {
//     return {
//       id: item.id,
//       name: item.name ?? '',
//       phone: item.phone ?? null,
//       designation: item.designation ?? null,
//       createdAt: item.createdAt ?? item.created_at ?? null,
//     };
//   };

//   const normalizeClient = (item: any): Client => {
//     return {
//       id: item.id,

//       clientId: item.clientId ?? item.client_id ?? '',
//       clientName: item.clientName ?? item.client_name ?? '',
//       clientPhone: item.clientPhone ?? item.client_phone ?? null,

//       primaryIp: item.primaryIp ?? item.primary_ip ?? null,
//       primaryOnu: item.primaryOnu ?? item.primary_onu ?? null,

//       secondaryIp: item.secondaryIp ?? item.secondary_ip ?? null,
//       secondaryOnu: item.secondaryOnu ?? item.secondary_onu ?? null,

//       location: item.location ?? null,

//       pocId: item.pocId ?? item.poc_id ?? null,
//       pocName: item.pocName ?? item.poc_name ?? null,

//       status:
//         item.status === 'Disconnected'
//           ? 'Disconnected'
//           : 'Connected',

//       description: item.description ?? null,

//       createdAt: item.createdAt ?? item.created_at ?? null,
//       updatedAt: item.updatedAt ?? item.updated_at ?? null,
//     };
//   };

//   // =========================================================
//   // LOAD POC
//   // =========================================================

//   const loadPocs = async () => {
//     try {
//       const response = await fetch('/api/pocs', {
//         method: 'GET',
//         cache: 'no-store',
//       });

//       const data = await response.json().catch(() => null);

//       if (!response.ok) {
//         throw new Error(
//           data?.error || 'Failed to load POCs.'
//         );
//       }

//       const rawPocs =
//         Array.isArray(data)
//           ? data
//           : data?.pocs ?? data?.data ?? [];

//       setPocs(rawPocs.map(normalizePoc));
//     } catch (error) {
//       console.error('Failed to load POCs:', error);

//       showToast(
//         error instanceof Error
//           ? error.message
//           : 'Failed to load POCs.',
//         'error'
//       );
//     }
//   };

//   // =========================================================
//   // LOAD CLIENTS
//   // =========================================================

//   const loadClients = async () => {
//     try {
//       setLoading(true);

//       const response = await fetch('/api/clients', {
//         method: 'GET',
//         cache: 'no-store',
//       });

//       const data = await response.json().catch(() => null);

//       if (!response.ok) {
//         throw new Error(
//           data?.error || 'Failed to load clients.'
//         );
//       }

//       const rawClients =
//         Array.isArray(data)
//           ? data
//           : data?.clients ?? data?.data ?? [];

//       setClients(rawClients.map(normalizeClient));
//     } catch (error) {
//       console.error('Failed to load clients:', error);

//       showToast(
//         error instanceof Error
//           ? error.message
//           : 'Failed to load clients.',
//         'error'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================================================
//   // INITIAL LOAD
//   // =========================================================

//   useEffect(() => {
//     if (!isAuthenticated) return;

//     loadPocs();
//     loadClients();
//   }, [isAuthenticated]);

//   // =========================================================
//   // REFRESH PAGE
//   // =========================================================

//   const handleClientDirectoryClick = () => {
//     window.location.reload();
//   };

//   // =========================================================
//   // FILTER + SEARCH
//   // =========================================================

//   const filteredClients = useMemo(() => {
//     const q = searchQuery.trim().toLowerCase();

//     return clients
//       .filter((client) => {
//         const searchableText = [
//           client.clientId,
//           client.clientName,
//           client.clientPhone,

//           client.pocName,

//           client.primaryIp,
//           client.primaryOnu,

//           client.secondaryIp,
//           client.secondaryOnu,

//           client.location,
//           client.description,
//         ]
//           .filter(Boolean)
//           .join(' ')
//           .toLowerCase();

//         const matchesSearch =
//           !q || searchableText.includes(q);

//         const matchesStatus =
//           statusFilter === 'All' ||
//           client.status === statusFilter;

//         const matchesPoc =
//           pocFilter === 'All' ||
//           client.pocId?.toString() === pocFilter;

//         return (
//           matchesSearch &&
//           matchesStatus &&
//           matchesPoc
//         );
//       })
//       .sort((a, b) => {
//         if (sortBy === 'newest') {
//           return Number(b.id) - Number(a.id);
//         }

//         if (sortBy === 'oldest') {
//           return Number(a.id) - Number(b.id);
//         }

//         if (sortBy === 'name') {
//           return (a.clientName || '').localeCompare(
//             b.clientName || ''
//           );
//         }

//         if (sortBy === 'clientId') {
//           return (a.clientId || '').localeCompare(
//             b.clientId || ''
//           );
//         }

//         return 0;
//       });
//   }, [
//     clients,
//     searchQuery,
//     statusFilter,
//     pocFilter,
//     sortBy,
//   ]);

//   // =========================================================
//   // PAGINATION
//   // =========================================================

//   const totalPages = Math.max(
//     1,
//     Math.ceil(filteredClients.length / itemsPerPage)
//   );

//   const paginatedClients = filteredClients.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [
//     searchQuery,
//     statusFilter,
//     pocFilter,
//     sortBy,
//   ]);

//   // =========================================================
//   // CLIENT FORM
//   // =========================================================

//   const updateClientForm = (
//     field: keyof ClientForm,
//     value: string
//   ) => {
//     setClientForm((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   // =========================================================
//   // OPEN ADD CLIENT
//   // =========================================================

//   const handleOpenAddClient = () => {
//     setEditingClient(null);
//     setClientForm(EMPTY_CLIENT_FORM);
//     setIsClientModalOpen(true);
//   };

//   // =========================================================
//   // OPEN EDIT CLIENT
//   // =========================================================

//   const handleEditClient = (client: Client) => {
//     setEditingClient(client);

//     setClientForm({
//       clientId: client.clientId || '',
//       clientName: client.clientName || '',
//       clientPhone: client.clientPhone || '',
//       primaryIp: client.primaryIp || '',
//       primaryOnu: client.primaryOnu || '',
//       secondaryIp: client.secondaryIp || '',
//       secondaryOnu: client.secondaryOnu || '',
//       location: client.location || '',
//       pocId:
//         client.pocId !== null &&
//           client.pocId !== undefined
//           ? String(client.pocId)
//           : '',
//       status: client.status || 'Connected',
//       description: client.description || '',
//     });

//     setIsClientModalOpen(true);
//   };

//   // =========================================================
//   // SAVE CLIENT
//   // =========================================================

//   const handleSaveClient = async (
//     e: React.FormEvent
//   ) => {
//     e.preventDefault();

//     if (!clientForm.clientId.trim()) {
//       showToast(
//         'Client ID is required.',
//         'error'
//       );
//       return;
//     }

//     if (!clientForm.clientName.trim()) {
//       showToast(
//         'Client name is required.',
//         'error'
//       );
//       return;
//     }

//     try {
//       const url = editingClient
//         ? `/api/clients/${editingClient.id}`
//         : '/api/clients';

//       const method = editingClient
//         ? 'PUT'
//         : 'POST';

//       const payload = {
//         clientId: clientForm.clientId.trim(),
//         clientName: clientForm.clientName.trim(),

//         clientPhone:
//           clientForm.clientPhone.trim() || null,

//         primaryIp:
//           clientForm.primaryIp.trim() || null,

//         primaryOnu:
//           clientForm.primaryOnu.trim() || null,

//         secondaryIp:
//           clientForm.secondaryIp.trim() || null,

//         secondaryOnu:
//           clientForm.secondaryOnu.trim() || null,

//         location:
//           clientForm.location.trim() || null,

//         pocId:
//           clientForm.pocId
//             ? Number(clientForm.pocId)
//             : null,

//         status: clientForm.status,

//         description:
//           clientForm.description.trim() || null,
//       };

//       const response = await fetch(url, {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await response
//         .json()
//         .catch(() => null);

//       if (!response.ok) {
//         throw new Error(
//           data?.error ||
//           `Failed to ${editingClient
//             ? 'update'
//             : 'add'
//           } client.`
//         );
//       }

//       const savedClient =
//         data?.client ??
//         data?.data ??
//         data;

//       const normalizedClient =
//         normalizeClient(savedClient);

//       if (editingClient) {
//         setClients((prev) =>
//           prev.map((client) =>
//             String(client.id) ===
//               String(editingClient.id)
//               ? normalizedClient
//               : client
//           )
//         );

//         showToast(
//           'Client updated successfully!',
//           'edit'
//         );
//       } else {
//         setClients((prev) => [
//           normalizedClient,
//           ...prev,
//         ]);

//         showToast(
//           'Client added successfully!',
//           'success'
//         );
//       }

//       setClientForm(EMPTY_CLIENT_FORM);
//       setEditingClient(null);
//       setIsClientModalOpen(false);
//     } catch (error) {
//       console.error(
//         'Error saving client:',
//         error
//       );

//       showToast(
//         error instanceof Error
//           ? error.message
//           : 'Database request failed.',
//         'error'
//       );
//     }
//   };

//   // =========================================================
//   // DELETE CLIENT
//   // =========================================================

//   const confirmDeleteClient = async () => {
//     if (
//       deleteClientTargetId === null ||
//       deleteClientTargetId === undefined
//     ) {
//       return;
//     }

//     const id = deleteClientTargetId;

//     try {
//       const response = await fetch(
//         `/api/clients/${id}`,
//         {
//           method: 'DELETE',
//         }
//       );

//       const data = await response
//         .json()
//         .catch(() => null);

//       if (!response.ok) {
//         throw new Error(
//           data?.error ||
//           'Failed to delete client.'
//         );
//       }

//       setClients((prev) =>
//         prev.filter(
//           (client) =>
//             String(client.id) !== String(id)
//         )
//       );

//       setSelectedClient((prev) =>
//         prev &&
//           String(prev.id) === String(id)
//           ? null
//           : prev
//       );

//       showToast(
//         'Client deleted successfully!',
//         'delete'
//       );
//     } catch (error) {
//       console.error(
//         'Error deleting client:',
//         error
//       );

//       showToast(
//         error instanceof Error
//           ? error.message
//           : 'Failed to delete client.',
//         'error'
//       );
//     } finally {
//       setDeleteClientTargetId(null);
//     }
//   };

//   // =========================================================
//   // POC FORM
//   // =========================================================

//   const handleOpenAddPoc = () => {
//     setIsPocManagementOpen(false);
//     setEditingPoc(null);
//     setPocForm(EMPTY_POC_FORM);
//     setIsPocModalOpen(true);
//   };

//   const handleEditPoc = (poc: POC) => {
//     setIsPocManagementOpen(false);

//     setEditingPoc(poc);

//     setPocForm({
//       name: poc.name || '',
//     });

//     setIsPocModalOpen(true);
//   };

//   // =========================================================
//   // SAVE POC
//   // =========================================================

//   const handleSavePoc = async (
//     e: React.FormEvent
//   ) => {
//     e.preventDefault();

//     if (!pocForm.name.trim()) {
//       showToast(
//         'POC name is required!',
//         'error'
//       );
//       return;
//     }

//     try {
//       const url = editingPoc
//         ? `/api/pocs/${editingPoc.id}`
//         : '/api/pocs';

//       const method = editingPoc
//         ? 'PUT'
//         : 'POST';

//       const response = await fetch(url, {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           name: pocForm.name.trim(),
//         }),
//       });

//       const data = await response
//         .json()
//         .catch(() => null);

//       if (!response.ok) {
//         throw new Error(
//           data?.error ||
//           `Failed to ${editingPoc
//             ? 'update'
//             : 'add'
//           } POC.`
//         );
//       }

//       const savedPoc =
//         data?.poc ??
//         data?.data ??
//         data;

//       const normalizedPoc =
//         normalizePoc(savedPoc);

//       if (editingPoc) {
//         setPocs((prev) =>
//           prev.map((poc) =>
//             String(poc.id) ===
//               String(editingPoc.id)
//               ? normalizedPoc
//               : poc
//           )
//         );

//         setClients((prev) =>
//           prev.map((client) =>
//             String(client.pocId) ===
//               String(editingPoc.id)
//               ? {
//                 ...client,
//                 pocName:
//                   normalizedPoc.name,
//               }
//               : client
//           )
//         );

//         showToast(
//           'POC updated successfully!',
//           'edit'
//         );
//       } else {
//         setPocs((prev) => [
//           normalizedPoc,
//           ...prev,
//         ]);

//         showToast(
//           'POC added successfully!',
//           'success'
//         );
//       }

//       setPocForm(EMPTY_POC_FORM);
//       setEditingPoc(null);
//       setIsPocModalOpen(false);
//     } catch (error) {
//       console.error(
//         'Error saving POC:',
//         error
//       );

//       showToast(
//         error instanceof Error
//           ? error.message
//           : 'Database request failed.',
//         'error'
//       );
//     }
//   };

//   // =========================================================
//   // DELETE POC
//   // =========================================================

//   const confirmDeletePoc = async () => {
//     if (
//       deletePocTargetId === null ||
//       deletePocTargetId === undefined
//     ) {
//       return;
//     }

//     const id = deletePocTargetId;

//     try {
//       const response = await fetch(
//         `/api/pocs/${id}`,
//         {
//           method: 'DELETE',
//         }
//       );

//       const data = await response
//         .json()
//         .catch(() => null);

//       if (!response.ok) {
//         throw new Error(
//           data?.error ||
//           'Failed to delete POC.'
//         );
//       }

//       setPocs((prev) =>
//         prev.filter(
//           (poc) =>
//             String(poc.id) !== String(id)
//         )
//       );

//       setClients((prev) =>
//         prev.map((client) =>
//           String(client.pocId) ===
//             String(id)
//             ? {
//               ...client,
//               pocId: null,
//               pocName: '',
//             }
//             : client
//         )
//       );

//       if (
//         pocFilter === String(id)
//       ) {
//         setPocFilter('All');
//       }

//       showToast(
//         'POC deleted successfully!',
//         'delete'
//       );
//     } catch (error) {
//       console.error(
//         'Error deleting POC:',
//         error
//       );

//       showToast(
//         error instanceof Error
//           ? error.message
//           : 'Failed to delete POC.',
//         'error'
//       );
//     } finally {
//       setDeletePocTargetId(null);
//     }
//   };

//   // =========================================================
//   // DATE FORMAT
//   // =========================================================

//   const formatDate = (
//     date?: string | null
//   ) => {
//     if (!date) return 'N/A';

//     const parsed = new Date(date);

//     if (Number.isNaN(parsed.getTime())) {
//       return date;
//     }

//     return parsed.toLocaleString(
//       'en-GB',
//       {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true,
//       }
//     );
//   };

//   // =========================================================
//   // AUTH LOADING SCREEN
//   // =========================================================

//   if (authChecking) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-4">
//           <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-teal-600 animate-spin" />

//           <p className="text-sm font-medium text-slate-500">
//             Checking authentication...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return null;
//   }

//   // =========================================================
//   // UI
//   // =========================================================

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-900">

//       {/* =====================================================
//           HEADER
//       ===================================================== */}

//       <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
//         <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

//           <div className="h-16 flex items-center justify-between gap-4">

//             <button
//               type="button"
//               onClick={handleClientDirectoryClick}
//               className="flex items-center gap-3 cursor-pointer group"
//             >
//               <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:shadow-md">
//                 <svg
//                   width="21"
//                   height="21"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                 >
//                   <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
//                   <circle cx="9" cy="7" r="4" />
//                   <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
//                   <path d="M16 3.13a4 4 0 0 1 0 7.75" />
//                 </svg>
//               </div>

//               <div className="text-left">
//                 <h1 className="font-bold text-lg text-slate-800 leading-tight">
//                   Client Directory
//                 </h1>

//                 <p className="text-xs text-slate-500">
//                   Client Information Management
//                 </p>
//               </div>
//             </button>

//             <div className="flex items-center gap-2">

//               <button
//                 type="button"
//                 onClick={handleOpenAddClient}
//                 className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold shadow-sm hover:bg-teal-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 ease-out cursor-pointer"
//               >
//                 <span className="text-lg leading-none">
//                   +
//                 </span>
//                 Add Client
//               </button>

//               <button
//                 type="button"
//                 onClick={() =>
//                   setIsPocManagementOpen(true)
//                 }
//                 className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 ease-out cursor-pointer"
//               >
//                 <span>👤</span>
//                 Manage POC
//               </button>

//             </div>
//           </div>
//         </div>
//       </header>

//       {/* =====================================================
//           MAIN
//       ===================================================== */}

//       <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

//         {/* ===================================================
//             SUMMARY CARDS
//         =================================================== */}

//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

//           <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-slate-500">
//                   Total Clients
//                 </p>

//                 <p className="text-2xl font-bold text-slate-800 mt-1">
//                   {clients.length}
//                 </p>
//               </div>

//               <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
//                 👥
//               </div>
//             </div>
//           </div>

//           <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-slate-500">
//                   Connected
//                 </p>

//                 <p className="text-2xl font-bold text-emerald-600 mt-1">
//                   {
//                     clients.filter(
//                       (client) =>
//                         client.status ===
//                         'Connected'
//                     ).length
//                   }
//                 </p>
//               </div>

//               <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
//                 ✓
//               </div>
//             </div>
//           </div>

//           <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-slate-500">
//                   Disconnected
//                 </p>

//                 <p className="text-2xl font-bold text-red-600 mt-1">
//                   {
//                     clients.filter(
//                       (client) =>
//                         client.status ===
//                         'Disconnected'
//                     ).length
//                   }
//                 </p>
//               </div>

//               <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-xl">
//                 !
//               </div>
//             </div>
//           </div>

//           <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-slate-500">
//                   Total POC
//                 </p>

//                 <p className="text-2xl font-bold text-blue-600 mt-1">
//                   {pocs.length}
//                 </p>
//               </div>

//               <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
//                 👤
//               </div>
//             </div>
//           </div>

//         </div>

//         {/* ===================================================
//             FILTER BAR
//         =================================================== */}

//         <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-6">

//           <div className="flex flex-col xl:flex-row gap-4">

//             {/* Search */}

//             <div className="relative flex-1">

//               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                 <svg
//                   width="19"
//                   height="19"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   className="text-slate-400"
//                 >
//                   <circle cx="11" cy="11" r="8" />
//                   <path d="m21 21-4.3-4.3" />
//                 </svg>
//               </div>

//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) =>
//                   setSearchQuery(
//                     e.target.value
//                   )
//                 }
//                 placeholder="Search Client ID, Name, Phone, POC, IP, ONU, Location..."
//                 className="w-full h-11 pl-11 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200"
//               />

//               {searchQuery && (
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setSearchQuery('')
//                   }
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
//                 >
//                   ×
//                 </button>
//               )}

//             </div>

//             {/* Status */}

//             <select
//               value={statusFilter}
//               onChange={(e) =>
//                 setStatusFilter(
//                   e.target.value as
//                   | 'All'
//                   | ClientStatus
//                 )
//               }
//               className="h-11 min-w-[170px] px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 cursor-pointer transition-all duration-200"
//             >
//               <option value="All">
//                 All Status
//               </option>
//               <option value="Connected">
//                 Connected
//               </option>
//               <option value="Disconnected">
//                 Disconnected
//               </option>
//             </select>

//             {/* POC */}

//             <select
//               value={pocFilter}
//               onChange={(e) =>
//                 setPocFilter(
//                   e.target.value
//                 )
//               }
//               className="h-11 min-w-[190px] px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 cursor-pointer transition-all duration-200"
//             >
//               <option value="All">
//                 All POC
//               </option>

//               {pocs.map((poc) => (
//                 <option
//                   key={poc.id}
//                   value={String(poc.id)}
//                 >
//                   {poc.name}
//                 </option>
//               ))}
//             </select>

//             {/* Sort */}

//             <select
//               value={sortBy}
//               onChange={(e) =>
//                 setSortBy(
//                   e.target.value as
//                   | 'newest'
//                   | 'oldest'
//                   | 'name'
//                   | 'clientId'
//                 )
//               }
//               className="h-11 min-w-[170px] px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 cursor-pointer transition-all duration-200"
//             >
//               <option value="newest">
//                 Newest First
//               </option>

//               <option value="oldest">
//                 Oldest First
//               </option>

//               <option value="name">
//                 Client Name
//               </option>

//               <option value="clientId">
//                 Client ID
//               </option>
//             </select>

//           </div>

//           {/* Second row */}

//           <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

//             <div className="flex items-center gap-2 flex-wrap">

//               <span className="text-sm text-slate-500">
//                 Showing{' '}
//                 <strong className="text-slate-700">
//                   {filteredClients.length}
//                 </strong>{' '}
//                 client(s)
//               </span>

//               {(searchQuery ||
//                 statusFilter !== 'All' ||
//                 pocFilter !== 'All') && (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setSearchQuery('');
//                       setStatusFilter('All');
//                       setPocFilter('All');
//                     }}
//                     className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 cursor-pointer transition-all duration-200"
//                   >
//                     Clear Filters
//                   </button>
//                 )}

//             </div>

//             <div className="flex items-center gap-2">

//               <button
//                 type="button"
//                 onClick={() =>
//                   setViewMode('table')
//                 }
//                 className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ${viewMode === 'table'
//                   ? 'bg-teal-600 text-white shadow-sm'
//                   : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
//                   }`}
//                 title="Table View"
//               >
//                 ☰
//               </button>

//               <button
//                 type="button"
//                 onClick={() =>
//                   setViewMode('grid')
//                 }
//                 className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ${viewMode === 'grid'
//                   ? 'bg-teal-600 text-white shadow-sm'
//                   : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
//                   }`}
//                 title="Grid View"
//               >
//                 ▦
//               </button>

//             </div>
//           </div>

//         </div>

//         {/* ===================================================
//             CLIENT LIST
//         =================================================== */}

//         {loading ? (
//           <div className="bg-white border border-slate-200 rounded-2xl shadow-sm min-h-[350px] flex items-center justify-center">
//             <div className="flex flex-col items-center gap-3">
//               <div className="w-9 h-9 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />

//               <p className="text-sm text-slate-500">
//                 Loading clients...
//               </p>
//             </div>
//           </div>
//         ) : filteredClients.length === 0 ? (
//           <div className="bg-white border border-slate-200 rounded-2xl shadow-sm min-h-[350px] flex flex-col items-center justify-center text-center p-8">

//             <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mb-4">
//               👥
//             </div>

//             <h3 className="text-lg font-bold text-slate-800">
//               No clients found
//             </h3>

//             <p className="text-sm text-slate-500 mt-1 max-w-md">
//               No client matches your current
//               search or filter.
//             </p>

//             <button
//               type="button"
//               onClick={handleOpenAddClient}
//               className="mt-5 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 cursor-pointer transition-all duration-200"
//             >
//               + Add Client
//             </button>

//           </div>
//         ) : viewMode === 'table' ? (

//           /* =================================================
//              TABLE VIEW
//           ================================================= */

//           <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

//             <div className="overflow-x-auto">

//               <table className="w-full min-w-[1250px]">

//                 <thead>
//                   <tr className="bg-slate-50 border-b border-slate-200">

//                     <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
//                       Client
//                     </th>

//                     <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
//                       Contact
//                     </th>

//                     <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
//                       Primary
//                     </th>

//                     <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
//                       Secondary
//                     </th>

//                     <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
//                       POC
//                     </th>

//                     <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
//                       Status
//                     </th>

//                     <th className="px-5 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
//                       Action
//                     </th>

//                   </tr>
//                 </thead>

//                 <tbody className="divide-y divide-slate-100">

//                   {paginatedClients.map(
//                     (client) => (
//                       <tr
//                         key={client.id}
//                         className="hover:bg-slate-50/70 transition-colors duration-150"
//                       >

//                         {/* Client */}

//                         <td className="px-5 py-4">

//                           <button
//                             type="button"
//                             onClick={() =>
//                               setSelectedClient(
//                                 client
//                               )
//                             }
//                             className="text-left cursor-pointer group"
//                           >

//                             <div className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
//                               {client.clientName ||
//                                 'N/A'}
//                             </div>

//                             <div className="text-xs font-mono text-teal-600 mt-1">
//                               {client.clientId ||
//                                 'N/A'}
//                             </div>

//                             {client.location && (
//                               <div className="text-xs text-slate-400 mt-1">
//                                 📍{' '}
//                                 {client.location}
//                               </div>
//                             )}

//                           </button>

//                         </td>

//                         {/* Contact */}

//                         <td className="px-5 py-4">

//                           <div className="text-sm font-medium text-slate-700">
//                             {client.clientPhone ||
//                               'N/A'}
//                           </div>

//                         </td>

//                         {/* Primary */}

//                         <td className="px-5 py-4">

//                           <div className="space-y-1">

//                             <div className="text-sm font-mono font-semibold text-slate-700">
//                               {client.primaryIp ||
//                                 'N/A'}
//                             </div>

//                             <div className="text-xs text-slate-500">
//                               ONU:{' '}
//                               {client.primaryOnu ||
//                                 'N/A'}
//                             </div>

//                           </div>

//                         </td>

//                         {/* Secondary */}

//                         <td className="px-5 py-4">

//                           <div className="space-y-1">

//                             <div className="text-sm font-mono font-semibold text-slate-700">
//                               {client.secondaryIp ||
//                                 'N/A'}
//                             </div>

//                             <div className="text-xs text-slate-500">
//                               ONU:{' '}
//                               {client.secondaryOnu ||
//                                 'N/A'}
//                             </div>

//                           </div>

//                         </td>

//                         {/* POC */}

//                         <td className="px-5 py-4">

//                           <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
//                             {client.pocName ||
//                               'No POC'}
//                           </span>

//                         </td>

//                         {/* Status */}

//                         <td className="px-5 py-4">

//                           {client.status ===
//                             'Connected' ? (
//                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
//                               <span className="w-2 h-2 rounded-full bg-emerald-500" />
//                               Connected
//                             </span>
//                           ) : (
//                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold">
//                               <span className="w-2 h-2 rounded-full bg-red-500" />
//                               Disconnected
//                             </span>
//                           )}

//                         </td>

//                         {/* Actions */}

//                         <td className="px-5 py-4">

//                           <div className="flex items-center justify-end gap-2">

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setSelectedClient(
//                                   client
//                                 )
//                               }
//                               className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
//                               title="View Details"
//                             >
//                               👁
//                             </button>

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 handleEditClient(
//                                   client
//                                 )
//                               }
//                               className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
//                               title="Edit Client"
//                             >
//                               ✎
//                             </button>

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setDeleteClientTargetId(
//                                   client.id
//                                 )
//                               }
//                               className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
//                               title="Delete Client"
//                             >
//                               🗑
//                             </button>

//                           </div>

//                         </td>

//                       </tr>
//                     )
//                   )}

//                 </tbody>

//               </table>

//             </div>

//           </div>

//         ) : (

//           /* =================================================
//              GRID VIEW
//           ================================================= */

//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

//             {paginatedClients.map(
//               (client) => (
//                 <div
//                   key={client.id}
//                   className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
//                 >

//                   <div className="flex items-start justify-between gap-3">

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setSelectedClient(
//                           client
//                         )
//                       }
//                       className="text-left min-w-0 cursor-pointer"
//                     >
//                       <h3 className="font-bold text-slate-800 truncate hover:text-teal-600">
//                         {client.clientName ||
//                           'N/A'}
//                       </h3>

//                       <p className="text-xs font-mono text-teal-600 mt-1">
//                         {client.clientId ||
//                           'N/A'}
//                       </p>
//                     </button>

//                     {client.status ===
//                       'Connected' ? (
//                       <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
//                         Connected
//                       </span>
//                     ) : (
//                       <span className="shrink-0 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold">
//                         Disconnected
//                       </span>
//                     )}

//                   </div>

//                   <div className="mt-5 space-y-3">

//                     <div>
//                       <p className="text-[11px] uppercase font-bold text-slate-400">
//                         Phone
//                       </p>

//                       <p className="text-sm font-medium text-slate-700 mt-1">
//                         {client.clientPhone ||
//                           'N/A'}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-[11px] uppercase font-bold text-slate-400">
//                         Primary
//                       </p>

//                       <p className="text-sm font-mono text-slate-700 mt-1">
//                         {client.primaryIp ||
//                           'N/A'}
//                       </p>

//                       <p className="text-xs text-slate-500">
//                         ONU:{' '}
//                         {client.primaryOnu ||
//                           'N/A'}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-[11px] uppercase font-bold text-slate-400">
//                         Secondary
//                       </p>

//                       <p className="text-sm font-mono text-slate-700 mt-1">
//                         {client.secondaryIp ||
//                           'N/A'}
//                       </p>

//                       <p className="text-xs text-slate-500">
//                         ONU:{' '}
//                         {client.secondaryOnu ||
//                           'N/A'}
//                       </p>
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-[11px] uppercase font-bold text-slate-400">
//                           POC
//                         </p>

//                         <p className="text-sm font-semibold text-blue-600 mt-1">
//                           {client.pocName ||
//                             'No POC'}
//                         </p>
//                       </div>

//                       <div className="text-right">
//                         <p className="text-[11px] uppercase font-bold text-slate-400">
//                           Location
//                         </p>

//                         <p className="text-xs text-slate-600 mt-1 max-w-[150px] truncate">
//                           {client.location ||
//                             'N/A'}
//                         </p>
//                       </div>
//                     </div>

//                   </div>

//                   <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setSelectedClient(
//                           client
//                         )
//                       }
//                       className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer transition-all duration-200"
//                     >
//                       View
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() =>
//                         handleEditClient(
//                           client
//                         )
//                       }
//                       className="px-3 py-2 rounded-lg bg-orange-50 text-orange-600 text-xs font-semibold hover:bg-orange-100 cursor-pointer transition-all duration-200"
//                     >
//                       Edit
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setDeleteClientTargetId(
//                           client.id
//                         )
//                       }
//                       className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 cursor-pointer transition-all duration-200"
//                     >
//                       Delete
//                     </button>

//                   </div>

//                 </div>
//               )
//             )}

//           </div>
//         )}

//         {/* ===================================================
//             PAGINATION
//         =================================================== */}

//         {filteredClients.length > 0 && (
//           <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">

//             <p className="text-sm text-slate-500">
//               Page{' '}
//               <strong className="text-slate-700">
//                 {currentPage}
//               </strong>{' '}
//               of{' '}
//               <strong className="text-slate-700">
//                 {totalPages}
//               </strong>
//             </p>

//             <div className="flex items-center gap-2">

//               <button
//                 type="button"
//                 disabled={currentPage <= 1}
//                 onClick={() =>
//                   setCurrentPage((page) =>
//                     Math.max(1, page - 1)
//                   )
//                 }
//                 className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer transition-all duration-200"
//               >
//                 Previous
//               </button>

//               {Array.from(
//                 { length: totalPages },
//                 (_, index) => index + 1
//               )
//                 .filter((page) => {
//                   if (totalPages <= 5)
//                     return true;

//                   return (
//                     page === 1 ||
//                     page === totalPages ||
//                     Math.abs(
//                       page - currentPage
//                     ) <= 1
//                   );
//                 })
//                 .map((page) => (
//                   <button
//                     type="button"
//                     key={page}
//                     onClick={() =>
//                       setCurrentPage(page)
//                     }
//                     className={`w-9 h-9 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 ${page === currentPage
//                       ? 'bg-teal-600 text-white shadow-sm'
//                       : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
//                       }`}
//                   >
//                     {page}
//                   </button>
//                 ))}

//               <button
//                 type="button"
//                 disabled={
//                   currentPage >= totalPages
//                 }
//                 onClick={() =>
//                   setCurrentPage((page) =>
//                     Math.min(
//                       totalPages,
//                       page + 1
//                     )
//                   )
//                 }
//                 className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer transition-all duration-200"
//               >
//                 Next
//               </button>

//             </div>
//           </div>
//         )}

//       </main>

//       {/* =====================================================
//           CLIENT ADD / EDIT MODAL
//       ===================================================== */}

//       {isClientModalOpen && (
//         <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">

//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden">

//             <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

//               <div>
//                 <h2 className="text-xl font-bold text-slate-800">
//                   {editingClient
//                     ? 'Edit Client'
//                     : 'Add New Client'}
//                 </h2>

//                 <p className="text-sm text-slate-500 mt-1">
//                   {editingClient
//                     ? 'Update client information'
//                     : 'Enter client information'}
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={() =>
//                   setIsClientModalOpen(false)
//                 }
//                 className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer transition-all duration-200"
//               >
//                 ×
//               </button>

//             </div>

//             <form
//               onSubmit={handleSaveClient}
//               className="overflow-y-auto max-h-[calc(92vh-90px)]"
//             >

//               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

//                 {/* Client ID */}

//                 <div>
//                   <label className="block text-sm font-semibold text-slate-700 mb-2">
//                     Client ID *
//                   </label>

//                   <input
//                     type="text"
//                     value={clientForm.clientId}
//                     onChange={(e) =>
//                       updateClientForm(
//                         'clientId',
//                         e.target.value
//                       )
//                     }
//                     placeholder="Enter Client ID"
//                     className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
//                   />
//                 </div>

//                 {/* Client Name */}

//                 <div>
//                   <label className="block text-sm font-semibold text-slate-700 mb-2">
//                     Client Name *
//                   </label>

//                   <input
//                     type="text"
//                     value={
//                       clientForm.clientName
//                     }
//                     onChange={(e) =>
//                       updateClientForm(
//                         'clientName',
//                         e.target.value
//                       )
//                     }
//                     placeholder="Enter Client Name"
//                     className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
//                   />
//                 </div>

//                 {/* Phone */}

//                 <div>
//                   <label className="block text-sm font-semibold text-slate-700 mb-2">
//                     Phone
//                   </label>

//                   <input
//                     type="text"
//                     value={
//                       clientForm.clientPhone
//                     }
//                     onChange={(e) =>
//                       updateClientForm(
//                         'clientPhone',
//                         e.target.value
//                       )
//                     }
//                     placeholder="01XXXXXXXXX"
//                     className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
//                   />
//                 </div>

//                 {/* Location */}

//                 <div>
//                   <label className="block text-sm font-semibold text-slate-700 mb-2">
//                     Location
//                   </label>

//                   <input
//                     type="text"
//                     value={
//                       clientForm.location
//                     }
//                     onChange={(e) =>
//                       updateClientForm(
//                         'location',
//                         e.target.value
//                       )
//                     }
//                     placeholder="Enter location"
//                     className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
//                   />
//                 </div>

//                 {/* Primary IP */}

//                 <div>
//                   <label className="block text-sm font-semibold text-slate-700 mb-2">
//                     Primary IP
//                   </label>

//                   <input
//                     type="text"
//                     value={
//                       clientForm.primaryIp
//                     }
//                     onChange={(e) =>
//                       updateClientForm(
//                         'primaryIp',
//                         e.target.value
//                       )
//                     }
//                     placeholder="192.168.x.x"
//                     className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 font-mono outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
//                   />
//                 </div>

//                 {/* Primary ONU */}

//                 <div>
//                   <label className="block text-sm font-semibold text-slate-700 mb-2">
//                     Primary ONU
//                   </label>

//                   <input
//                     type="text"
//                     value={
//                       clientForm.primaryOnu
//                     }
//                     onChange={(e) =>
//                       updateClientForm(
//                         'primaryOnu',
//                         e.target.value
//                       )
//                     }
//                     placeholder="Primary ONU"
//                     className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
//                   />
//                 </div>

//                 {/* Secondary IP */}

//                 <div>
//                   <label className="block text-sm font-semibold text-slate-700 mb-2">
//                     Secondary IP
//                   </label>

//                   <input
//                     type="text"
//                     value={
//                       clientForm.secondaryIp
//                     }
//                     onChange={(e) =>
//                       updateClientForm(
//                         'secondaryIp',
//                         e.target.value
//                       )
//                     }
//                     placeholder="192.168.x.x"
//                     className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 font-mono outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
//                   />
//                 </div>

//                 {/* Secondary ONU */}

//                 <div>
//                   <label className="block text-sm font-semibold text-slate-700 mb-2">
//                     Secondary ONU
//                   </label>

//                   <input
//                     type="text"
//                     value={
//                       clientForm.secondaryOnu
//                     }
//                     onChange={(e) =>
//                       updateClientForm(
//                         'secondaryOnu',
//                         e.target.value
//                       )
//                     }
//                     placeholder="Secondary ONU"
//                     className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
//                   />
//                 </div>

//                 {/* POC */}

//                 <div>
//                   <label className="block text-sm font-semibold text-slate-700 mb-2">
//                     POC
//                   </label>

//                   <select
//                     value={clientForm.pocId}
//                     onChange={(e) =>
//                       updateClientForm(
//                         'pocId',
//                         e.target.value
//                       )
//                     }
//                     className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 cursor-pointer"
//                   >
//                     <option value="">
//                       Select POC
//                     </option>

//                     {pocs.map((poc) => (
//                       <option
//                         key={poc.id}
//                         value={String(
//                           poc.id
//                         )}
//                       >
//                         {poc.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Status */}

//                 <div>
//                   <label className="block text-sm font-semibold text-slate-700 mb-2">
//                     Status
//                   </label>

//                   <select
//                     value={
//                       clientForm.status
//                     }
//                     onChange={(e) =>
//                       updateClientForm(
//                         'status',
//                         e.target.value
//                       )
//                     }
//                     className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 cursor-pointer"
//                   >
//                     <option value="Connected">
//                       Connected
//                     </option>

//                     <option value="Disconnected">
//                       Disconnected
//                     </option>
//                   </select>
//                 </div>

//                 {/* Description */}

//                 <div className="md:col-span-2">

//                   <label className="block text-sm font-semibold text-slate-700 mb-2">
//                     Description
//                   </label>

//                   <textarea
//                     value={
//                       clientForm.description
//                     }
//                     onChange={(e) =>
//                       updateClientForm(
//                         'description',
//                         e.target.value
//                       )
//                     }
//                     rows={4}
//                     placeholder="Additional information..."
//                     className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all resize-none"
//                   />

//                 </div>

//               </div>

//               {/* Footer */}

//               <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setIsClientModalOpen(false)
//                   }
//                   className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-100 cursor-pointer transition-all duration-200"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 ${editingClient
//                     ? 'bg-orange-500 hover:bg-orange-600'
//                     : 'bg-teal-600 hover:bg-teal-700'
//                     }`}
//                 >
//                   {editingClient
//                     ? 'Update Client'
//                     : 'Add Client'}
//                 </button>

//               </div>

//             </form>

//           </div>
//         </div>
//       )}

//       {/* =====================================================
//           CLIENT DETAILS MODAL
//       ===================================================== */}

//       {selectedClient && (
//         <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">

//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">

//             <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

//               <div>
//                 <h2 className="text-xl font-bold text-slate-800">
//                   Client Details
//                 </h2>

//                 <p className="text-xs font-mono text-teal-600 mt-1">
//                   {selectedClient.clientId}
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={() =>
//                   setSelectedClient(null)
//                 }
//                 className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer transition-all duration-200"
//               >
//                 ×
//               </button>

//             </div>

//             <div className="p-6 overflow-y-auto max-h-[calc(90vh-85px)]">

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 {[
//                   [
//                     'Client Name',
//                     selectedClient.clientName,
//                   ],
//                   [
//                     'Phone',
//                     selectedClient.clientPhone ||
//                     'N/A',
//                   ],
//                   [
//                     'Location',
//                     selectedClient.location ||
//                     'N/A',
//                   ],
//                   [
//                     'POC',
//                     selectedClient.pocName ||
//                     'N/A',
//                   ],
//                   [
//                     'Primary IP',
//                     selectedClient.primaryIp ||
//                     'N/A',
//                   ],
//                   [
//                     'Primary ONU',
//                     selectedClient.primaryOnu ||
//                     'N/A',
//                   ],
//                   [
//                     'Secondary IP',
//                     selectedClient.secondaryIp ||
//                     'N/A',
//                   ],
//                   [
//                     'Secondary ONU',
//                     selectedClient.secondaryOnu ||
//                     'N/A',
//                   ],
//                   [
//                     'Status',
//                     selectedClient.status,
//                   ],
//                   [
//                     'Created',
//                     formatDate(
//                       selectedClient.createdAt
//                     ),
//                   ],
//                   [
//                     'Updated',
//                     formatDate(
//                       selectedClient.updatedAt
//                     ),
//                   ],
//                 ].map(
//                   ([label, value]) => (
//                     <div
//                       key={label}
//                       className="rounded-xl bg-slate-50 border border-slate-100 p-4"
//                     >
//                       <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
//                         {label}
//                       </p>

//                       <p className="font-semibold text-slate-700 mt-1 break-words">
//                         {value}
//                       </p>
//                     </div>
//                   )
//                 )}

//               </div>

//               {selectedClient.description && (
//                 <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-4">

//                   <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
//                     Description
//                   </p>

//                   <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
//                     {
//                       selectedClient.description
//                     }
//                   </p>

//                 </div>
//               )}

//               <div className="mt-5 flex justify-end gap-2">

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setSelectedClient(null);
//                     handleEditClient(
//                       selectedClient
//                     );
//                   }}
//                   className="px-4 py-2.5 rounded-xl bg-orange-50 text-orange-600 text-sm font-semibold hover:bg-orange-100 cursor-pointer transition-all duration-200"
//                 >
//                   Edit Client
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setSelectedClient(null)
//                   }
//                   className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 cursor-pointer transition-all duration-200"
//                 >
//                   Close
//                 </button>

//               </div>

//             </div>
//           </div>
//         </div>
//       )}

//       {/* =====================================================
//           POC MANAGEMENT MODAL
//       ===================================================== */}

//       {isPocManagementOpen && (
//         <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">

//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-hidden">

//             <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

//               <div>
//                 <h2 className="text-xl font-bold text-slate-800">
//                   Manage POC
//                 </h2>

//                 <p className="text-sm text-slate-500 mt-1">
//                   Add, edit or delete point of contacts
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={() =>
//                   setIsPocManagementOpen(false)
//                 }
//                 className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer transition-all duration-200"
//               >
//                 ×
//               </button>

//             </div>

//             <div className="p-5">

//               <button
//                 type="button"
//                 onClick={handleOpenAddPoc}
//                 className="w-full mb-4 px-4 py-3 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer transition-all duration-200"
//               >
//                 + Add New POC
//               </button>

//               <div className="space-y-2 max-h-[55vh] overflow-y-auto">

//                 {pocs.length === 0 ? (
//                   <div className="py-10 text-center text-sm text-slate-500">
//                     No POC found.
//                   </div>
//                 ) : (
//                   pocs.map((poc) => (
//                     <div
//                       key={poc.id}
//                       className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm transition-all duration-200"
//                     >

//                       <div className="min-w-0">

//                         <p className="font-semibold text-slate-800 truncate">
//                           {poc.name}
//                         </p>

//                         <p className="text-xs text-slate-400 mt-1">
//                           POC ID: {poc.id}
//                         </p>

//                       </div>

//                       <div className="flex items-center gap-2 shrink-0">

//                         <button
//                           type="button"
//                           onClick={() =>
//                             handleEditPoc(
//                               poc
//                             )
//                           }
//                           className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
//                           title="Edit POC"
//                         >
//                           ✎
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() =>
//                             setDeletePocTargetId(
//                               poc.id
//                             )
//                           }
//                           className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
//                           title="Delete POC"
//                         >
//                           🗑
//                         </button>

//                       </div>

//                     </div>
//                   ))
//                 )}

//               </div>

//             </div>
//           </div>
//         </div>
//       )}

//       {/* =====================================================
//           POC ADD / EDIT MODAL
//       ===================================================== */}

//       {isPocModalOpen && (
//         <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">

//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

//             <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

//               <div>
//                 <h2 className="text-xl font-bold text-slate-800">
//                   {editingPoc
//                     ? 'Edit POC'
//                     : 'Add POC'}
//                 </h2>

//                 <p className="text-sm text-slate-500 mt-1">
//                   {editingPoc
//                     ? 'Update POC information'
//                     : 'Create a new POC'}
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={() =>
//                   setIsPocModalOpen(false)
//                 }
//                 className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer transition-all duration-200"
//               >
//                 ×
//               </button>

//             </div>

//             <form
//               onSubmit={handleSavePoc}
//             >

//               <div className="p-6">

//                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                   POC Name *
//                 </label>

//                 <input
//                   type="text"
//                   value={pocForm.name}
//                   onChange={(e) =>
//                     setPocForm({
//                       name: e.target.value,
//                     })
//                   }
//                   placeholder="Enter POC name"
//                   autoFocus
//                   className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
//                 />

//               </div>

//               <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setIsPocModalOpen(false)
//                   }
//                   className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-100 cursor-pointer transition-all duration-200"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 ${editingPoc
//                     ? 'bg-orange-500 hover:bg-orange-600'
//                     : 'bg-teal-600 hover:bg-teal-700'
//                     }`}
//                 >
//                   {editingPoc
//                     ? 'Update POC'
//                     : 'Add POC'}
//                 </button>

//               </div>

//             </form>

//           </div>
//         </div>
//       )}

//       {/* =====================================================
//           DELETE CLIENT CONFIRM
//       ===================================================== */}

//       {deleteClientTargetId !==
//         null && (
//           <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">

//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">

//               <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl mb-4">
//                 🗑
//               </div>

//               <h3 className="text-lg font-bold text-slate-800">
//                 Delete Client?
//               </h3>

//               <p className="text-sm text-slate-500 mt-2">
//                 Are you sure you want to delete
//                 this client? This action cannot
//                 be undone.
//               </p>

//               <div className="flex justify-end gap-3 mt-6">

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setDeleteClientTargetId(
//                       null
//                     )
//                   }
//                   className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 cursor-pointer transition-all duration-200"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="button"
//                   onClick={
//                     confirmDeleteClient
//                   }
//                   className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer transition-all duration-200"
//                 >
//                   Delete Client
//                 </button>

//               </div>

//             </div>
//           </div>
//         )}

//       {/* =====================================================
//           DELETE POC CONFIRM
//       ===================================================== */}

//       {deletePocTargetId !== null && (
//         <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">

//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">

//             <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl mb-4">
//               🗑
//             </div>

//             <h3 className="text-lg font-bold text-slate-800">
//               Delete POC?
//             </h3>

//             <p className="text-sm text-slate-500 mt-2">
//               Are you sure you want to delete
//               this POC?
//             </p>

//             <p className="text-xs text-orange-600 mt-2">
//               Clients assigned to this POC
//               will become unassigned.
//             </p>

//             <div className="flex justify-end gap-3 mt-6">

//               <button
//                 type="button"
//                 onClick={() =>
//                   setDeletePocTargetId(
//                     null
//                   )
//                 }
//                 className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 cursor-pointer transition-all duration-200"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={confirmDeletePoc}
//                 className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer transition-all duration-200"
//               >
//                 Delete POC
//               </button>

//             </div>

//           </div>
//         </div>
//       )}

//       {/* =====================================================
//           TOAST
//       ===================================================== */}

//       <div className="fixed top-20 right-4 z-[100] w-[min(380px,calc(100vw-2rem))] space-y-3">

//         {toasts.map((toast) => {

//           const config = {
//             success: {
//               bg: 'bg-emerald-600',
//               icon: '✓',
//             },
//             edit: {
//               bg: 'bg-orange-500',
//               icon: '✎',
//             },
//             delete: {
//               bg: 'bg-red-600',
//               icon: '🗑',
//             },
//             error: {
//               bg: 'bg-red-600',
//               icon: '!',
//             },
//           }[toast.type];

//           return (
//             <div
//               key={toast.id}
//               className={`${config.bg} text-white rounded-xl shadow-xl px-4 py-3 flex items-start gap-3 animate-[slideIn_0.25s_ease-out]`}
//             >

//               <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0 font-bold">
//                 {config.icon}
//               </div>

//               <p className="text-sm font-semibold flex-1 pt-1">
//                 {toast.message}
//               </p>

//               <button
//                 type="button"
//                 onClick={() =>
//                   removeToast(toast.id)
//                 }
//                 className="text-white/80 hover:text-white cursor-pointer text-lg leading-none"
//               >
//                 ×
//               </button>

//             </div>
//           );
//         })}

//       </div>

//       <style jsx global>{`
//         @keyframes slideIn {
//           from {
//             opacity: 0;
//             transform: translateX(20px);
//           }

//           to {
//             opacity: 1;
//             transform: translateX(0);
//           }
//         }
//       `}</style>

//     </div>
//   );
// }


