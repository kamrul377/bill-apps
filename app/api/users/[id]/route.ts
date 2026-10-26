// import { NextRequest, NextResponse } from 'next/server';
// import { deleteUser, getUserById, updateUser } from '@/lib/db';
// import { UserRole } from '@/lib/types';

// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const requesterRole = req.headers.get('x-user-role') as UserRole | null;
//     const { id } = await params;
//     const numericId = parseInt(id, 10);
//     if (isNaN(numericId)) {
//       return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });
//     }

//     if (!requesterRole || (requesterRole !== 'admin' && requesterRole !== 'manager')) {
//       return NextResponse.json(
//         { error: 'Unauthorized to modify user accounts.' },
//         { status: 403 }
//       );
//     }

//     const targetUser = await getUserById(numericId);
//     if (!targetUser) {
//       return NextResponse.json({ error: 'User not found.' }, { status: 404 });
//     }

//     // Manager can only manage Support users
//     if (requesterRole === 'manager' && targetUser.role !== 'support') {
//       return NextResponse.json(
//         { error: 'Managers can only modify Support accounts.' },
//         { status: 403 }
//       );
//     }

//     const body = await req.json();

//     // Manager cannot promote a user to manager, admin, or accounts
//     if (requesterRole === 'manager' && body.role && body.role !== 'support') {
//       return NextResponse.json(
//         { error: 'Managers cannot modify role beyond Support.' },
//         { status: 403 }
//       );
//     }

//     const result = await updateUser(numericId, body);

//     if (!result.success) {
//       return NextResponse.json({ error: result.error }, { status: 400 });
//     }

//     return NextResponse.json({
//       success: true,
//       user: result.user,
//       message: 'User updated successfully in MySQL database.',
//     });
//   } catch (error) {
//     console.error('Update user error:', error);
//     return NextResponse.json(
//       { error: 'Failed to update user in MySQL database.' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const requesterRole = req.headers.get('x-user-role') as UserRole | null;
//     const { id } = await params;
//     const numericId = parseInt(id, 10);
//     if (isNaN(numericId)) {
//       return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });
//     }

//     if (!requesterRole || (requesterRole !== 'admin' && requesterRole !== 'manager')) {
//       return NextResponse.json(
//         { error: 'Unauthorized to delete user accounts.' },
//         { status: 403 }
//       );
//     }

//     const targetUser = await getUserById(numericId);
//     if (!targetUser) {
//       return NextResponse.json({ error: 'User not found.' }, { status: 404 });
//     }

//     // Manager can only delete Support staff
//     if (requesterRole === 'manager' && targetUser.role !== 'support') {
//       return NextResponse.json(
//         { error: 'Managers are only permitted to manage Support staff accounts.' },
//         { status: 403 }
//       );
//     }

//     const result = await deleteUser(numericId);
//     if (!result.success) {
//       return NextResponse.json({ error: result.error }, { status: 400 });
//     }

//     return NextResponse.json({
//       success: true,
//       message: 'User deleted successfully from MySQL database.',
//     });
//   } catch (error) {
//     console.error('Delete user error:', error);
//     return NextResponse.json(
//       { error: 'Failed to delete user from MySQL database.' },
//       { status: 500 }
//     );
//   }
// }





// ======================2nd===============








import { NextRequest, NextResponse } from 'next/server';
import { deleteUser, getUserById, updateUser } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth';
import type { UserRole } from '@/lib/types';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: Context) {
  const requester = await getCurrentUser(req);

  if (!requester) {
    return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  }

  if (!['admin', 'manager'].includes(requester.role)) {
    return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (!Number.isSafeInteger(numericId) || numericId <= 0) {
      return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });
    }

    const target = await getUserById(numericId);

    if (!target) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (requester.role === 'manager' && target.role !== 'support') {
      return NextResponse.json({ error: 'Managers can modify Support users only.' }, { status: 403 });
    }

    const body = await req.json();

    if (body.role !== undefined) {
      const validRoles: UserRole[] = ['admin', 'manager', 'support', 'accounts'];

      if (typeof body.role !== 'string' || !validRoles.includes(body.role)) {
        return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
      }

      if (requester.role === 'manager' && body.role !== 'support') {
        return NextResponse.json({ error: 'Managers can assign Support role only.' }, { status: 403 });
      }
    }

    // Prevent deleting or changing your own admin account via this endpoint.
    if (requester.id === numericId && body.role && body.role !== requester.role) {
      return NextResponse.json({ error: 'You cannot change your own role.' }, { status: 403 });
    }

    const result = await updateUser(numericId, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Update failed.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: result.user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  const requester = await getCurrentUser(req);

  if (!requester) {
    return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  }

  if (!['admin', 'manager'].includes(requester.role)) {
    return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (!Number.isSafeInteger(numericId) || numericId <= 0) {
      return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });
    }

    if (requester.id === numericId) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 403 });
    }

    const target = await getUserById(numericId);

    if (!target) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (requester.role === 'manager' && target.role !== 'support') {
      return NextResponse.json({ error: 'Managers can delete Support users only.' }, { status: 403 });
    }

    const result = await deleteUser(numericId);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Delete failed.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user.' }, { status: 500 });
  }
}
