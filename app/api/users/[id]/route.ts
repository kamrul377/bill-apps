import { NextRequest, NextResponse } from 'next/server';
import { deleteUser, getUserById, updateUser } from '@/lib/db';
import { UserRole } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const requesterRole = req.headers.get('x-user-role') as UserRole | null;
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });
    }

    if (!requesterRole || (requesterRole !== 'admin' && requesterRole !== 'manager')) {
      return NextResponse.json(
        { error: 'Unauthorized to modify user accounts.' },
        { status: 403 }
      );
    }

    const targetUser = await getUserById(numericId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Manager can only manage Support users
    if (requesterRole === 'manager' && targetUser.role !== 'support') {
      return NextResponse.json(
        { error: 'Managers can only modify Support accounts.' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Manager cannot promote a user to manager, admin, or accounts
    if (requesterRole === 'manager' && body.role && body.role !== 'support') {
      return NextResponse.json(
        { error: 'Managers cannot modify role beyond Support.' },
        { status: 403 }
      );
    }

    const result = await updateUser(numericId, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      message: 'User updated successfully in MySQL database.',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user in MySQL database.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const requesterRole = req.headers.get('x-user-role') as UserRole | null;
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });
    }

    if (!requesterRole || (requesterRole !== 'admin' && requesterRole !== 'manager')) {
      return NextResponse.json(
        { error: 'Unauthorized to delete user accounts.' },
        { status: 403 }
      );
    }

    const targetUser = await getUserById(numericId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Manager can only delete Support staff
    if (requesterRole === 'manager' && targetUser.role !== 'support') {
      return NextResponse.json(
        { error: 'Managers are only permitted to manage Support staff accounts.' },
        { status: 403 }
      );
    }

    const result = await deleteUser(numericId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully from MySQL database.',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user from MySQL database.' },
      { status: 500 }
    );
  }
}
