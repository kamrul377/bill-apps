// // import { NextRequest, NextResponse } from 'next/server';
// // import { authenticateUser } from '@/lib/db';

// // export async function POST(req: NextRequest) {
// //   try {
// //     const body = await req.json();
// //     const email = body.email || body.user_id;
// //     const password = body.password || body.pass;

// //     // console.log(email, password)

// //     if (!email || !password) {
// //       return NextResponse.json(
// //         { error: 'Email and Password are required.' },
// //         { status: 400 }
// //       );
// //     }

// //     const user = await authenticateUser(email, password);
// //     if (!user) {
// //       return NextResponse.json(
// //         { error: 'Invalid Email or Password. Please check credentials.' },
// //         { status: 401 }
// //       );
// //     }

// //     return NextResponse.json({
// //       success: true,
// //       user,
// //       message: `Logged in as ${user.name} (${user.role.toUpperCase()})`,
// //     });
// //   } catch (error) {
// //     console.error('Login error:', error);
// //     return NextResponse.json(
// //       { error: 'Authentication failed. Please ensure MySQL database is running and connected.' },
// //       { status: 500 }
// //     );
// //   }
// // }



// import { NextRequest, NextResponse } from 'next/server';
// import { authenticateUser } from '@/lib/db';
// import {
//   createSessionToken,
//   SESSION_COOKIE,
//   SESSION_MAX_AGE,
// } from '@/lib/auth';

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const email = body.email || body.user_id;
//     const password = body.password || body.pass;

//     if (!email || !password) {
//       return NextResponse.json(
//         { error: 'Email and Password are required.' },
//         { status: 400 }
//       );
//     }

//     const user = await authenticateUser(email, password);

//     if (!user) {
//       return NextResponse.json(
//         { error: 'Invalid Email or Password.' },
//         { status: 401 }
//       );
//     }

//     const token = createSessionToken({
//       id: user.id,
//       user_id: user.user_id,
//       name: user.name,
//       role: user.role,
//     });

//     const response = NextResponse.json({
//       success: true,
//       user,
//       message: `Logged in as ${user.name}`,
//     });

//     response.cookies.set(SESSION_COOKIE, token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       path: '/',
//       maxAge: SESSION_MAX_AGE,
//     });

//     return response;
//   } catch (error) {
//     console.error('Login error:', error);

//     return NextResponse.json(
//       { error: 'Authentication failed.' },
//       { status: 500 }
//     );
//   }
// }


// =========2nd==========



import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/db';
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email || body.user_id;
    const password = body.password || body.pass;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email.trim(), password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const token = createSessionToken({
      id: user.id,
      user_id: user.user_id,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        user_id: user.user_id,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);

    return NextResponse.json(
      { success: false, error: 'Authentication failed.' },
      { status: 500 }
    );
  }
}
