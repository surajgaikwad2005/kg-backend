import { NextResponse } from 'next/server';
import { mockStore } from '../mockStore';

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        let scenarioId = searchParams.get('scenario_id');
        
        // If not in search params, try parsing body
        if (!scenarioId) {
            try {
                const body = await request.json();
                scenarioId = body?.scenario_id;
            } catch {
                // Ignore parsing errors and rely on query param check
            }
        }

        if (!scenarioId) {
            return NextResponse.json({
                success: false,
                message: "Missing scenario_id in query parameters or request body",
                data: null
            }, { status: 400 });
        }

        const success = mockStore.deleteScenario(scenarioId);
        
        if (!success) {
            return NextResponse.json({
                success: false,
                message: `Scenario with ID ${scenarioId} not found`,
                data: null
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Scenario deleted successfully",
            data: {
                scenario_id: Number(scenarioId)
            }
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message || "Failed to delete scenario",
            data: null
        }, { status: 500 });
    }
}
