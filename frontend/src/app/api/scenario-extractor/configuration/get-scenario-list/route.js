import { NextResponse } from 'next/server';
import { mockStore } from '../mockStore';

export async function GET() {
    try {
        const data = mockStore.getScenarios();
        return NextResponse.json({
            success: true,
            message: "Operation completed successfully",
            data,
            pagination: {
                page: 1,
                page_size: 20,
                total_records: data.length,
                total_pages: 1
            }
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message || "Failed to list scenarios",
            data: []
        }, { status: 500 });
    }
}
