// import { NextRequest, NextResponse } from 'next/server';
// import { createUser, getUsers } from '@/lib/db';
// import { UserRole } from '@/lib/types';

// export async function GET(req: NextRequest) {
//   try {
//     const requesterRole = req.headers.get('x-user-role') as UserRole | null;

//     if (!requesterRole || (requesterRole !== 'admin' && requesterRole !== 'manager')) {
//       return NextResponse.json(
//         { error: 'Access denied. Only Admin and Manager can view staff records.' },
//         { status: 403 }
//       );
//     }

//     const allUsers = await getUsers();

//     // If Manager, only return Support staff
//     if (requesterRole === 'manager') {
//       const supportUsers = allUsers.filter((u) => u.role === 'support');
//       return NextResponse.json({ success: true, users: supportUsers });
//     }

//     // Admin gets all users
//     return NextResponse.json({ success: true, users: allUsers });
//   } catch (error) {
//     console.error('Get users error:', error);
//     return NextResponse.json(
//       { error: 'Failed to retrieve users from MySQL database.' },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const requesterRole = req.headers.get('x-user-role') as UserRole | null;
//     const body = await req.json();
//     const { user_id, name, password, role } = body;

//     // Strict Authorization Rules:
//     // 1. Only Admin can create their accounts (Admin, Manager, Accounts, Support)
//     // 2. Manager can ONLY create Support accounts
//     // 3. Anyone else cannot create accounts
//     if (!requesterRole || (requesterRole !== 'admin' && requesterRole !== 'manager')) {
//       return NextResponse.json(
//         { error: 'Unauthorized. Public account creation is disabled. Only Admin can create accounts, and Manager can create Support accounts.' },
//         { status: 403 }
//       );
//     }

//     const validRoles: UserRole[] = ['admin', 'support', 'manager', 'accounts'];
//     if (!validRoles.includes(role)) {
//       return NextResponse.json(
//         { error: 'Invalid role specified.' },
//         { status: 400 }
//       );
//     }

//     // If Manager is attempting to create non-support account:
//     if (requesterRole === 'manager' && role !== 'support') {
//       return NextResponse.json(
//         {
//           error: 'Access Denied: Managers are strictly permitted to create Support accounts only. Only Admin can create Admin, Manager, and Accounts accounts.',
//         },
//         { status: 403 }
//       );
//     }

//     const result = await createUser({ user_id, name, password, role });
//     if (!result.success) {
//       return NextResponse.json({ error: result.error }, { status: 400 });
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         user: result.user,
//         message: `Account for "${result.user?.name}" created successfully with role ${role.toUpperCase()}.`,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error('Create user error:', error);
//     return NextResponse.json(
//       { error: 'Failed to create user in MySQL database.' },
//       { status: 500 }
//     );
//   }
// }



// =========================2nd part ========================

// import { NextRequest, NextResponse } from 'next/server';
// import { createUser, getUsers } from '@/lib/db';
// import { UserRole } from '@/lib/types';

// export async function GET(req: NextRequest) {
//   try {
//     const requesterRole = req.headers.get('x-user-role') as UserRole | null;

//     if (!requesterRole || (requesterRole !== 'admin' && requesterRole !== 'manager')) {
//       return NextResponse.json(
//         { error: 'Access denied. Only Admin and Manager can view staff records.' },
//         { status: 403 }
//       );
//     }

//     const allUsers = await getUsers();

//     // If Manager, only return Support staff
//     if (requesterRole === 'manager') {
//       const supportUsers = allUsers.filter((u) => u.role === 'support');
//       return NextResponse.json({ success: true, users: supportUsers });
//     }

//     // Admin gets all users
//     return NextResponse.json({ success: true, users: allUsers });
//   } catch (error) {
//     console.error('Get users error:', error);
//     return NextResponse.json(
//       { error: 'Failed to retrieve users from MySQL database.' },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const requesterRole = req.headers.get('x-user-role') as UserRole | null;

//     // Strict Authorization Rules:
//     if (!requesterRole || (requesterRole !== 'admin' && requesterRole !== 'manager')) {
//       return NextResponse.json(
//         { error: 'Unauthorized. Only Admin and Manager can create accounts.' },
//         { status: 403 }
//       );
//     }

//     // Parse Body Safely
//     let body;
//     try {
//       body = await req.json();
//     } catch (e) {
//       return NextResponse.json(
//         { error: 'Invalid JSON payload in request body.' },
//         { status: 400 }
//       );
//     }

//     const { user_id, name, password, role } = body || {};

//     // 1. Missing Fields Check (400 Bad Request prevention)
//     if (!user_id || !name || !password || !role) {
//       return NextResponse.json(
//         {
//           error: 'Missing required fields. Please provide user_id, name, password, and role.',
//           receivedData: { user_id: !!user_id, name: !!name, password: !!password, role: !!role }
//         },
//         { status: 400 }
//       );
//     }

//     // Normalize role string (lowercase and trim whitespace)
//     const normalizedRole = String(role).trim().toLowerCase() as UserRole;

//     // 2. Role Validation Check
//     const validRoles: UserRole[] = ['admin', 'support', 'manager', 'accounts'];
//     if (!validRoles.includes(normalizedRole)) {
//       return NextResponse.json(
//         { error: `Invalid role "${role}". Allowed roles are: ${validRoles.join(', ')}` },
//         { status: 400 }
//       );
//     }

//     // 3. Manager Permission Restrictions Check
//     if (requesterRole === 'manager' && normalizedRole !== 'support') {
//       return NextResponse.json(
//         { error: 'Access Denied: Managers can strictly create Support accounts only.' },
//         { status: 403 }
//       );
//     }

//     // 4. Create User in Database
//     const result = await createUser({
//       user_id: String(user_id).trim(),
//       name: String(name).trim(),
//       password,
//       role: normalizedRole,
//     });

//     if (!result.success) {
//       return NextResponse.json(
//         { error: result.error || 'Failed to create user in database.' },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         user: result.user,
//         message: `Account for "${result.user?.name || name}" created successfully with role ${normalizedRole.toUpperCase()}.`,
//       },
//       { status: 201 }
//     );
//   } catch (error: any) {
//     console.error('Create user error:', error);
//     return NextResponse.json(
//       { error: error?.message || 'Internal server error while creating user.' },
//       { status: 500 }
//     );
//   }
// }







// =====================create user and send mail==================


import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUsers } from '@/lib/db';
import { UserRole } from '@/lib/types';
import { sendWelcomeEmail } from '@/lib/mailer';

// GET: Retrieve staff records
export async function GET(req: NextRequest) {
  try {
    const requesterRole = req.headers.get('x-user-role') as UserRole | null;

    if (
      !requesterRole ||
      (requesterRole !== 'admin' && requesterRole !== 'manager')
    ) {
      return NextResponse.json(
        {
          error: 'Access denied. Only Admin and Manager can view staff records.',
        },
        { status: 403 }
      );
    }

    const allUsers = await getUsers();

    // Manager can view Support staff only
    if (requesterRole === 'manager') {
      const supportUsers = allUsers.filter(
        (user) => user.role === 'support'
      );

      return NextResponse.json({
        success: true,
        users: supportUsers,
      });
    }

    // Admin can view all users
    return NextResponse.json({
      success: true,
      users: allUsers,
    });
  } catch (error) {
    console.error('Get users error:', error);

    return NextResponse.json(
      { error: 'Failed to retrieve users from MySQL database.' },
      { status: 500 }
    );
  }
}

// POST: Create user and send welcome email
export async function POST(req: NextRequest) {
  try {
    const requesterRole = req.headers.get('x-user-role') as UserRole | null;

    // Authorization check
    if (
      !requesterRole ||
      (requesterRole !== 'admin' && requesterRole !== 'manager')
    ) {
      return NextResponse.json(
        {
          error: 'Unauthorized. Only Admin and Manager can create accounts.',
        },
        { status: 403 }
      );
    }

    // Parse request body
    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload in request body.' },
        { status: 400 }
      );
    }

    const { user_id, name, password, role } = body || {};

    // Required fields validation
    if (
      typeof user_id !== 'string' ||
      typeof name !== 'string' ||
      typeof password !== 'string' ||
      typeof role !== 'string' ||
      !user_id.trim() ||
      !name.trim() ||
      !password ||
      !role.trim()
    ) {
      return NextResponse.json(
        {
          error:
            'Missing or invalid fields. Please provide user_id, name, password, and role.',
        },
        { status: 400 }
      );
    }

    const username = user_id.trim().toLowerCase();
    const userName = name.trim();
    const normalizedRole = role.trim().toLowerCase() as UserRole;

    // Validate role
    const validRoles: UserRole[] = [
      'admin',
      'support',
      'manager',
      'accounts',
    ];

    if (!validRoles.includes(normalizedRole)) {
      return NextResponse.json(
        {
          error: `Invalid role "${role}". Allowed roles are: ${validRoles.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Manager can create Support accounts only
    if (requesterRole === 'manager' && normalizedRole !== 'support') {
      return NextResponse.json(
        {
          error:
            'Access denied. Managers can create Support accounts only.',
        },
        { status: 403 }
      );
    }

    // Create user in database
    const result = await createUser({
      user_id: username,
      name: userName,
      password,
      role: normalizedRole,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Failed to create user in database.',
        },
        { status: 400 }
      );
    }

    // Send welcome email
    // If email fails, the account remains created.
    let emailSent = false;

    try {
      await sendWelcomeEmail({
        email: username,
        name: userName,
        username,
        password,
        role: normalizedRole,
      });

      emailSent = true;
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    // Final response
    return NextResponse.json(
      {
        success: true,
        user: result.user,
        emailSent,
        message: emailSent
          ? `Account created successfully. Welcome email sent to ${username}.`
          : 'Account created successfully, but the welcome email could not be sent. Please check your SMTP configuration.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Create user error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error while creating user.',
      },
      { status: 500 }
    );
  }
}