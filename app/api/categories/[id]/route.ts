import { NextResponse } from 'next/server';
import { updateCategory, deleteCategory } from '@/lib/db';

// UPDATE Category (PUT)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const catId = Number(id);
        const body = await request.json();

        if (!body.name || !body.name.trim()) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        await updateCategory(catId, body.name.trim());
        return NextResponse.json({ success: true, message: 'Category updated successfully' });
    } catch (error: any) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update category' },
            { status: 500 }
        );
    }
}

// DELETE Category (DELETE)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const catId = Number(id);

        if (!catId) {
            return NextResponse.json(
                { error: 'Invalid category ID' },
                { status: 400 }
            );
        }

        await deleteCategory(catId);
        return NextResponse.json({ success: true, message: 'Category deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete category' },
            { status: 500 }
        );
    }
}