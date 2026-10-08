import { NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/lib/db'; // আপনার DB helper path অনুযায়ী দিন

// GET: Fetch categories
export async function GET() {
    try {
        const categories = await getCategories();
        return NextResponse.json({ categories });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
    }
}

// POST: Add new category from UI
export async function POST(req: Request) {
    try {
        const { name } = await req.json();

        if (!name || !name.trim()) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        const newCategory = await createCategory(name);
        return NextResponse.json({ category: newCategory }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
    }
}