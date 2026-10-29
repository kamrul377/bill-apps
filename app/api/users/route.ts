

// import { NextRequest, NextResponse } from 'next/server';
// import { createUser, getUsers } from '@/lib/db';
// import { getCurrentUser } from '@/lib/server-auth';
// import type { UserRole } from '@/lib/types';
// import { sendWelcomeEmail } from '@/lib/mailer';

// const allowedRoles: UserRole[] = [
//   'admin',
//   'manager',
//   'support',
//   'accounts',
// ];

// export async function GET(req: NextRequest) {
//   const requester = await getCurrentUser(req);

//   if (!requester) {
//     return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
//   }

//   if (!['admin', 'manager'].includes(requester.role)) {
//     return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
//   }

//   try {
//     const users = await getUsers();

//     return NextResponse.json({
//       success: true,
//       users: requester.role === 'manager'
//         ? users.filter(user => user.role === 'support')
//         : users,
//     });
//   } catch (error) {
//     console.error('Get users error:', error);
//     return NextResponse.json({ error: 'Failed to retrieve users.' }, { status: 500 });
//   }
// }

// export async function POST(req: NextRequest) {
//   const requester = await getCurrentUser(req);

//   if (!requester) {
//     return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
//   }

//   if (!['admin', 'manager'].includes(requester.role)) {
//     return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
//   }

//   try {
//     const body = await req.json();
//     const { user_id, name, password, role } = body ?? {};

//     if (
//       typeof user_id !== 'string' ||
//       typeof name !== 'string' ||
//       typeof password !== 'string' ||
//       typeof role !== 'string' ||
//       !user_id.trim() ||
//       !name.trim() ||
//       !password
//     ) {
//       return NextResponse.json({ error: 'Valid user ID, name, password and role are required.' }, { status: 400 });
//     }

//     const username = user_id.trim().toLowerCase();
//     const userName = name.trim();
//     const normalizedRole = role.trim().toLowerCase() as UserRole;

//     if (!allowedRoles.includes(normalizedRole)) {
//       return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
//     }

//     if (requester.role === 'manager' && normalizedRole !== 'support') {
//       return NextResponse.json({ error: 'Managers can create Support users only.' }, { status: 403 });
//     }

//     const result = await createUser({
//       user_id: username,
//       name: userName,
//       password,
//       role: normalizedRole,
//     });

//     if (!result.success) {
//       return NextResponse.json({ error: result.error || 'Failed to create user.' }, { status: 400 });
//     }

//     let emailSent = false;

//     try {
//       await sendWelcomeEmail({
//         email: username,
//         name: userName,
//         username,
//         password,
//         role: normalizedRole,
//       });
//       emailSent = true;
//     } catch (error) {
//       console.error('Welcome email failed:', error);
//     }

//     return NextResponse.json({
//       success: true,
//       user: result.user,
//       emailSent,
//       message: emailSent
//         ? 'Account created and welcome email sent.'
//         : 'Account created, but welcome email failed.',
//     }, { status: 201 });
//   } catch (error) {
//     console.error('Create user error:', error);
//     return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
//   }
// }





// ==============2nd=====================











// import { NextRequest, NextResponse } from 'next/server';
// import { createUser, getUsers } from '@/lib/db';
// import { getCurrentUser } from '@/lib/server-auth';
// import type { UserRole } from '@/lib/types';
// import { sendWelcomeEmail } from '@/lib/mailer';

// const allowedRoles: UserRole[] = [
//   'admin',
//   'manager',
//   'support',
//   'accounts',
// ];

// export async function GET(req: NextRequest) {
//   const requester = await getCurrentUser(req);

//   if (!requester) {
//     return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
//   }

//   if (!['admin', 'manager'].includes(requester.role)) {
//     return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
//   }

//   try {
//     const users = await getUsers();

//     return NextResponse.json({
//       success: true,
//       users: requester.role === 'manager'
//         ? users.filter(user => user.role === 'support')
//         : users,
//     });
//   } catch (error) {
//     console.error('Get users error:', error);
//     return NextResponse.json({ error: 'Failed to retrieve users.' }, { status: 500 });
//   }
// }

// export async function POST(req: NextRequest) {
//   const requester = await getCurrentUser(req);

//   if (!requester) {
//     return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
//   }

//   if (!['admin', 'manager'].includes(requester.role)) {
//     return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
//   }

//   try {
//     const body = await req.json();
//     const { user_id, name, password, role } = body ?? {};

//     if (
//       typeof user_id !== 'string' ||
//       typeof name !== 'string' ||
//       typeof password !== 'string' ||
//       typeof role !== 'string' ||
//       !user_id.trim() ||
//       !name.trim() ||
//       !password
//     ) {
//       return NextResponse.json({ error: 'Valid user ID, name, password and role are required.' }, { status: 400 });
//     }

//     const username = user_id.trim().toLowerCase();
//     const userName = name.trim();
//     const normalizedRole = role.trim().toLowerCase() as UserRole;

//     if (!allowedRoles.includes(normalizedRole)) {
//       return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
//     }

//     if (requester.role === 'manager' && normalizedRole !== 'support') {
//       return NextResponse.json({ error: 'Managers can create Support users only.' }, { status: 403 });
//     }

//     const result = await createUser({
//       user_id: username,
//       name: userName,
//       password,
//       role: normalizedRole,
//     });

//     if (!result.success) {
//       const errMessage = result.error || '';

//       // সুনির্দিষ্টভাবে চেক করছি কোনটি ডুপ্লিকেট হয়েছে
//       if (errMessage.includes('name') || (errMessage.includes('Duplicate entry') && errMessage.includes('name'))) {
//         return NextResponse.json({ error: 'User name already exists.' }, { status: 400 });
//       }
//       if (errMessage.includes('user_id') || errMessage.includes('Duplicate entry')) {
//         return NextResponse.json({ error: 'Email (User ID) already exists.' }, { status: 400 });
//       }

//       return NextResponse.json({ error: errMessage || 'Failed to create user.' }, { status: 400 });
//     }

//     let emailSent = false;

//     try {
//       await sendWelcomeEmail({
//         email: username,
//         name: userName,
//         username,
//         password,
//         role: normalizedRole,
//       });
//       emailSent = true;
//     } catch (error) {
//       console.error('Welcome email failed:', error);
//     }

//     return NextResponse.json({
//       success: true,
//       user: result.user,
//       emailSent,
//       message: emailSent
//         ? 'Account created and welcome email sent.'
//         : 'Account created, but welcome email failed.',
//     }, { status: 201 });

//   } catch (error: any) {
//     console.error('Create user error:', error);

//     const errorMsg = error.message || '';
//     if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062 || errorMsg.includes('Duplicate')) {
//       if (errorMsg.includes('name')) {
//         return NextResponse.json({ error: 'User name already exists.' }, { status: 400 });
//       }
//       return NextResponse.json({ error: 'Email (User ID) already exists.' }, { status: 400 });
//     }

//     return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
//   }
// }








// ==================3rd-----------================








import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUsers } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth';
import type { UserRole } from '@/lib/types';
import { sendWelcomeEmail } from '@/lib/mailer';

const allowedRoles: UserRole[] = [
  'admin',
  'manager',
  'support',
  'accounts',
];

export async function GET(req: NextRequest) {
  const requester = await getCurrentUser(req);

  if (!requester) {
    return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  }

  if (!['admin', 'manager'].includes(requester.role)) {
    return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
  }

  try {
    const users = await getUsers();

    return NextResponse.json({
      success: true,
      users: requester.role === 'manager'
        ? users.filter(user => user.role === 'support')
        : users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Failed to retrieve users.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const requester = await getCurrentUser(req);

  if (!requester) {
    return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  }

  if (!['admin', 'manager'].includes(requester.role)) {
    return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { user_id, name, password, role } = body ?? {};

    if (
      typeof user_id !== 'string' ||
      typeof name !== 'string' ||
      typeof password !== 'string' ||
      typeof role !== 'string' ||
      !user_id.trim() ||
      !name.trim() ||
      !password
    ) {
      return NextResponse.json({ error: 'Valid user ID, name, password and role are required.' }, { status: 400 });
    }

    const username = user_id.trim().toLowerCase();
    const userName = name.trim();
    const normalizedRole = role.trim().toLowerCase() as UserRole;

    if (!allowedRoles.includes(normalizedRole)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }

    if (requester.role === 'manager' && normalizedRole !== 'support') {
      return NextResponse.json({ error: 'Managers can create Support users only.' }, { status: 403 });
    }

    const result = await createUser({
      user_id: username,
      name: userName,
      password,
      role: normalizedRole,
    });

    if (!result.success) {
      const errMessage = result.error || '';
      const lowerErr = errMessage.toLowerCase();

      // সুনির্দিষ্টভাবে চেক করছি কোন ফিল্ডের কারণে ডুপ্লিকেট হয়েছে
      if (lowerErr.includes('name') || lowerErr.includes('for key \'users.name\'') || lowerErr.includes('key \'name\'')) {
        return NextResponse.json({ error: 'User name already exists.' }, { status: 400 });
      }
      if (lowerErr.includes('user_id') || lowerErr.includes('for key \'users.user_id\'') || lowerErr.includes('duplicate entry')) {
        return NextResponse.json({ error: 'Email (User ID) already exists.' }, { status: 400 });
      }

      return NextResponse.json({ error: errMessage || 'Failed to create user.' }, { status: 400 });
    }

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
    } catch (error) {
      console.error('Welcome email failed:', error);
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      emailSent,
      message: emailSent
        ? 'Account created and welcome email sent.'
        : 'Account created, but welcome email failed.',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create user error:', error);

    const errorMsg = (error.message || '').toLowerCase();
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062 || errorMsg.includes('duplicate')) {
      if (errorMsg.includes('name')) {
        return NextResponse.json({ error: 'User name already exists.' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Email (User ID) already exists.' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
  }
}