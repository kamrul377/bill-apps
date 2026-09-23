import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email || body.user_id;
    const password = body.password || body.pass;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and Password are required.' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid Email or Password. Please check credentials.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      message: `Logged in as ${user.name} (${user.role.toUpperCase()})`,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please ensure MySQL database is running and connected.' },
      { status: 500 }
    );
  }
}
