

import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
    const user = await getCurrentUser(req);

    if (!user) {
        return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }

    try {
        return NextResponse.json({ categories: await getCategories() });
    } catch (error) {
        console.error('Fetch categories error:', error);
        return NextResponse.json({ error: 'Failed to fetch categories.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const user = await getCurrentUser(req);

    if (!user) {
        return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }

    if (user.role !== 'admin') {
        return NextResponse.json({ error: 'Only Admin can create categories.' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const name = typeof body.name === 'string' ? body.name.trim() : '';

        if (!name) {
            return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
        }

        const category = await createCategory(name);

        return NextResponse.json({ success: true, category }, { status: 201 });
    } catch (error) {
        console.error('Create category error:', error);
        return NextResponse.json({ error: 'Failed to create category.' }, { status: 500 });
    }
}
