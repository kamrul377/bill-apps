
// import { NextRequest, NextResponse } from 'next/server';
// import { createBill, getBills, getDashboardStats } from '@/lib/db';
// import { UserRole } from '@/lib/types';

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const status = searchParams.get('status') || undefined;
//     const search = searchParams.get('search') || undefined;
//     const role = (searchParams.get('role') as UserRole) || undefined;
//     const currentUserId = searchParams.get('userId') || undefined;
//     const currentUserName = searchParams.get('userName') || undefined;

//     const bills = await getBills({
//       status,
//       search,
//       role,
//       currentUserId,
//       currentUserName,
//     });

//     const stats = await getDashboardStats({
//       role,
//       currentUserId,
//       currentUserName,
//     });

//     return NextResponse.json({
//       success: true,
//       bills,
//       stats,
//     });
//   } catch (error) {
//     console.error('Fetch bills error:', error);
//     return NextResponse.json(
//       { error: 'Failed to retrieve bills from MySQL database.' },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     // category_id body theke extract korun
//     const { ticket_id, user_id, amount, category_id, description, date, created_by } = body;

//     // console.log(category_id)

//     const result = await createBill({
//       ticket_id,
//       user_id,
//       amount,
//       category_id: category_id ? Number(category_id) : 1, // category_id createBill-e pass korun
//       description,
//       date,
//       created_by,
//     });

//     if (!result.success) {
//       return NextResponse.json(
//         { error: result.error },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         bill: result.bill,
//         message: `Bill ${result.bill?.ticket_id} created successfully with PENDING status.`,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error('Create bill error:', error);
//     return NextResponse.json(
//       { error: 'Failed to create bill in MySQL database.' },
//       { status: 500 }
//     );
//   }
// }



// ===============2nd================




// import { NextRequest, NextResponse } from 'next/server';
// import { createBill, getBills, getDashboardStats, updateBillsStatus } from '@/lib/db';
// import { UserRole } from '@/lib/types';

// // ==========================================
// // 1. GET: Fetch Bills & Stats (Parallelized)
// // ==========================================
// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const status = searchParams.get('status') || undefined;
//     const search = searchParams.get('search') || undefined;
//     const role = (searchParams.get('role') as UserRole) || undefined;
//     const currentUserId = searchParams.get('userId') || undefined;
//     const currentUserName = searchParams.get('userName') || undefined;

//     // Parallel Execution: Run queries simultaneously using Promise.all
//     const [bills, stats] = await Promise.all([
//       getBills({
//         status,
//         search,
//         role,
//         currentUserId,
//         currentUserName,
//       }),
//       getDashboardStats({
//         role,
//         currentUserId,
//         currentUserName,
//       }),
//     ]);

//     return NextResponse.json({
//       success: true,
//       bills,
//       stats,
//     });
//   } catch (error) {
//     console.error('Fetch bills error:', error);
//     return NextResponse.json(
//       { error: 'Failed to retrieve bills from MySQL database.' },
//       { status: 500 }
//     );
//   }
// }

// // ==========================================
// // 2. POST: Create Single Bill
// // ==========================================
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { ticket_id, user_id, amount, category_id, description, date, created_by } = body;

//     const result = await createBill({
//       ticket_id,
//       user_id,
//       amount,
//       category_id: category_id ? Number(category_id) : 1,
//       description,
//       date,
//       created_by,
//     });

//     if (!result.success) {
//       return NextResponse.json(
//         { error: result.error },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         bill: result.bill,
//         message: `Bill ${result.bill?.ticket_id} created successfully with PENDING status.`,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error('Create bill error:', error);
//     return NextResponse.json(
//       { error: 'Failed to create bill in MySQL database.' },
//       { status: 500 }
//     );
//   }
// }

// // ==========================================
// // 3. PATCH: Bulk Update / Fast Batch Approve
// // ==========================================
// export async function PATCH(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { billIds, status, actionBy } = body;

//     if (!Array.isArray(billIds) || billIds.length === 0) {
//       return NextResponse.json(
//         { error: 'No bill IDs provided for bulk action.' },
//         { status: 400 }
//       );
//     }

//     if (!status) {
//       return NextResponse.json(
//         { error: 'Status is required.' },
//         { status: 400 }
//       );
//     }

//     // Call single batch query in lib/db.ts
//     const result = await updateBillsStatus({
//       billIds,
//       status, // 'Approved' | 'Rejected' | 'Paid'
//       actionBy,
//     });

//     return NextResponse.json({
//       success: true,
//       message: `${billIds.length} bills updated to ${status} successfully.`,
//       result,
//     });
//   } catch (error) {
//     console.error('Batch update error:', error);
//     return NextResponse.json(
//       { error: 'Failed to process bulk operation.' },
//       { status: 500 }
//     );
//   }
// }




// ================3rd=============






import { NextRequest, NextResponse } from 'next/server';
import { createBill, getBills, getDashboardStats, updateBillsBatch } from '@/lib/db';
import { UserRole } from '@/lib/types';

// ==========================================
// 1. GET: Fetch Bills & Stats (Parallelized)
// ==========================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const role = (searchParams.get('role') as UserRole) || undefined;
    const currentUserId = searchParams.get('userId') || undefined;
    const currentUserName = searchParams.get('userName') || undefined;

    const [bills, stats] = await Promise.all([
      getBills({
        status,
        search,
        role,
        currentUserId,
        currentUserName,
      }),
      getDashboardStats({
        role,
        currentUserId,
        currentUserName,
      }),
    ]);

    return NextResponse.json({
      success: true,
      bills,
      stats,
    });
  } catch (error) {
    console.error('Fetch bills error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve bills from MySQL database.' },
      { status: 500 }
    );
  }
}

// ==========================================
// 2. POST: Create Single Bill
// ==========================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticket_id, user_id, amount, category_id, description, date, created_by } = body;

    const result = await createBill({
      ticket_id,
      user_id,
      amount,
      category_id: category_id ? Number(category_id) : 1,
      description,
      date,
      created_by,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        bill: result.bill,
        message: `Bill ${result.bill?.ticket_id} created successfully with PENDING status.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create bill error:', error);
    return NextResponse.json(
      { error: 'Failed to create bill in MySQL database.' },
      { status: 500 }
    );
  }
}

// ==========================================
// 3. PATCH: Bulk Update / Fast Batch Approve
// ==========================================
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { billIds, status, actionBy } = body;

    if (!Array.isArray(billIds) || billIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No bill IDs provided for bulk action.' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required.' },
        { status: 400 }
      );
    }

    const numericIds = billIds.map((id) => Number(id));

    // Calling the exact exported function from lib/db.ts
    const result = await updateBillsBatch(numericIds, status, {
      paidBy: actionBy,
    });

    return NextResponse.json({
      success: true,
      message: `${result.updatedCount} bills updated to ${status} successfully.`,
      result,
    });
  } catch (error) {
    console.error('Batch update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process bulk operation.' },
      { status: 500 }
    );
  }
}