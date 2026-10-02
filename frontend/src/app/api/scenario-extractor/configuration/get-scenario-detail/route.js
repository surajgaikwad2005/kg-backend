import { NextResponse } from 'next/server';
import { mockStore } from '../mockStore';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const scenarioId = searchParams.get('scenario_id');
        
        if (!scenarioId) {
            return NextResponse.json({
                success: false,
                message: "Missing scenario_id parameter",
                data: null
            }, { status: 400 });
        }

        const scenario = mockStore.getScenario(scenarioId);
        if (!scenario) {
            return NextResponse.json({
                success: false,
                message: `Scenario with ID ${scenarioId} not found`,
                data: null
            }, { status: 404 });
        }

        // Return detailed mock data with scenario matches as in the API spec
        const responseData = {
            ...scenario,
            matches: [
                {
                    match_id: 61603965,
                    scenario_id: scenario.scenario_id,
                    start_time: "2025-01-28 11:00:00",
                    end_time: "2025-01-28 19:00:00",
                    similarity: 71.39,
                    created_at: "2026-08-27T04:49:20.902485"
                },
                {
                    match_id: 61606088,
                    scenario_id: scenario.scenario_id,
                    start_time: "2025-01-27 09:30:00",
                    end_time: "2025-01-27 17:30:00",
                    similarity: 71.17,
                    created_at: "2026-08-27T04:49:20.902485"
                },
                {
                    match_id: 61609090,
                    scenario_id: scenario.scenario_id,
                    start_time: "2025-11-28 10:00:00",
                    end_time: "2025-11-28 18:00:00",
                    similarity: 70.76,
                    created_at: "2026-08-27T04:49:20.902485"
                },
                {
                    match_id: 61607648,
                    scenario_id: scenario.scenario_id,
                    start_time: "2025-02-27 23:45:00",
                    end_time: "2025-02-28 07:45:00",
                    similarity: 70.51,
                    created_at: "2026-08-27T04:49:20.902485"
                }
            ]
        };

        return NextResponse.json({
            success: true,
            message: "Operation completed successfully",
            data: responseData
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message || "Failed to get scenario detail",
            data: null
        }, { status: 500 });
    }
}
