import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUsers } from '@/lib/db';
import { UserRole } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const requesterRole = req.headers.get('x-user-role') as UserRole | null;

    if (!requesterRole || (requesterRole !== 'admin' && requesterRole !== 'manager')) {
      return NextResponse.json(
        { error: 'Access denied. Only Admin and Manager can view staff records.' },
        { status: 403 }
      );
    }

    const allUsers = await getUsers();

    // If Manager, only return Support staff
    if (requesterRole === 'manager') {
      const supportUsers = allUsers.filter((u) => u.role === 'support');
      return NextResponse.json({ success: true, users: supportUsers });
    }

    // Admin gets all users
    return NextResponse.json({ success: true, users: allUsers });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve users from MySQL database.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const requesterRole = req.headers.get('x-user-role') as UserRole | null;
    const body = await req.json();
    const { user_id, name, password, role } = body;

    // Strict Authorization Rules:
    // 1. Only Admin can create their accounts (Admin, Manager, Accounts, Support)
    // 2. Manager can ONLY create Support accounts
    // 3. Anyone else cannot create accounts
    if (!requesterRole || (requesterRole !== 'admin' && requesterRole !== 'manager')) {
      return NextResponse.json(
        { error: 'Unauthorized. Public account creation is disabled. Only Admin can create accounts, and Manager can create Support accounts.' },
        { status: 403 }
      );
    }

    const validRoles: UserRole[] = ['admin', 'support', 'manager', 'accounts'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified.' },
        { status: 400 }
      );
    }

    // If Manager is attempting to create non-support account:
    if (requesterRole === 'manager' && role !== 'support') {
      return NextResponse.json(
        {
          error: 'Access Denied: Managers are strictly permitted to create Support accounts only. Only Admin can create Admin, Manager, and Accounts accounts.',
        },
        { status: 403 }
      );
    }

    const result = await createUser({ user_id, name, password, role });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        user: result.user,
        message: `Account for "${result.user?.name}" created successfully with role ${role.toUpperCase()}.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user in MySQL database.' },
      { status: 500 }
    );
  }
}
