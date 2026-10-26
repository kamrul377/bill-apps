// import { NextResponse } from 'next/server';
// import { getCategories, createCategory } from '@/lib/db'; // আপনার DB helper path অনুযায়ী দিন

// // GET: Fetch categories
// export async function GET() {
//     try {
//         const categories = await getCategories();
//         return NextResponse.json({ categories });
//     } catch (error: any) {
//         return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
//     }
// }

// // POST: Add new category from UI
// export async function POST(req: Request) {
//     try {
//         const { name } = await req.json();

//         if (!name || !name.trim()) {
//             return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
//         }

//         const newCategory = await createCategory(name);
//         return NextResponse.json({ category: newCategory }, { status: 201 });
//     } catch (error: any) {
//         return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
//     }
// }




// =================2nd===================









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
