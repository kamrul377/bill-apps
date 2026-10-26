// import { NextResponse } from 'next/server';
// import { updateCategory, deleteCategory } from '@/lib/db';

// // UPDATE Category (PUT)
// export async function PUT(
//     request: Request,
//     { params }: { params: Promise<{ id: string }> }
// ) {
//     try {
//         const { id } = await params;
//         const catId = Number(id);
//         const body = await request.json();

//         if (!body.name || !body.name.trim()) {
//             return NextResponse.json(
//                 { error: 'Category name is required' },
//                 { status: 400 }
//             );
//         }

//         await updateCategory(catId, body.name.trim());
//         return NextResponse.json({ success: true, message: 'Category updated successfully' });
//     } catch (error: any) {
//         console.error('Error updating category:', error);
//         return NextResponse.json(
//             { error: error.message || 'Failed to update category' },
//             { status: 500 }
//         );
//     }
// }

// // DELETE Category (DELETE)
// export async function DELETE(
//     request: Request,
//     { params }: { params: Promise<{ id: string }> }
// ) {
//     try {
//         const { id } = await params;
//         const catId = Number(id);

//         if (!catId) {
//             return NextResponse.json(
//                 { error: 'Invalid category ID' },
//                 { status: 400 }
//             );
//         }

//         await deleteCategory(catId);
//         return NextResponse.json({ success: true, message: 'Category deleted successfully' });
//     } catch (error: any) {
//         console.error('Error deleting category:', error);
//         return NextResponse.json(
//             { error: error.message || 'Failed to delete category' },
//             { status: 500 }
//         );
//     }
// }

















import { NextRequest, NextResponse } from 'next/server';
import { updateCategory, deleteCategory } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth';

type Context = { params: Promise<{ id: string }> };

async function isAdmin(req: NextRequest) {
    const user = await getCurrentUser(req);
    return user?.role === 'admin';
}

export async function PUT(req: NextRequest, context: Context) {
    if (!(await isAdmin(req))) {
        const user = await getCurrentUser(req);
        return NextResponse.json(
            { error: user ? 'Only Admin can modify categories.' : 'Please log in.' },
            { status: user ? 403 : 401 }
        );
    }

    try {
        const { id } = await context.params;
        const catId = Number(id);
        const body = await req.json();
        const name = typeof body.name === 'string' ? body.name.trim() : '';

        if (!Number.isSafeInteger(catId) || catId <= 0 || !name) {
            return NextResponse.json({ error: 'Valid category ID and name are required.' }, { status: 400 });
        }

        await updateCategory(catId, name);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update category error:', error);
        return NextResponse.json({ error: 'Failed to update category.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: Context) {
    if (!(await isAdmin(req))) {
        const user = await getCurrentUser(req);
        return NextResponse.json(
            { error: user ? 'Only Admin can delete categories.' : 'Please log in.' },
            { status: user ? 403 : 401 }
        );
    }

    try {
        const { id } = await context.params;
        const catId = Number(id);

        if (!Number.isSafeInteger(catId) || catId <= 0) {
            return NextResponse.json({ error: 'Invalid category ID.' }, { status: 400 });
        }

        await deleteCategory(catId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete category error:', error);
        return NextResponse.json({ error: 'Failed to delete category.' }, { status: 500 });
    }
}
