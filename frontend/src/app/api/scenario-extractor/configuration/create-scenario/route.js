import { NextResponse } from 'next/server';
import { mockStore } from '../mockStore';

export async function POST(request) {
    try {
        const body = await request.json();
        
        // Basic validation
        if (!body.scenario_name || !body.asset || !body.tags || !Array.isArray(body.tags)) {
            return NextResponse.json({
                success: false,
                message: "Missing required fields (scenario_name, asset, tags)",
                data: null
            }, { status: 400 });
        }

        const newScenario = mockStore.addScenario({
            scenario_name: body.scenario_name,
            asset: body.asset,
            tags: body.tags,
            start_time: body.start_time || new Date().toISOString(),
            end_time: body.end_time || new Date().toISOString(),
            similarity_threshold: Number(body.similarity_threshold) || 70,
            plant_code_id: body.plant_code_id || 'Plant_1',
            pattern_window: body.pattern_window || 21
        });

        // Mock prediction matching response payload
        const matchStartTime = "2025-11-02 13:30:00";
        const matchEndTime = "2025-11-02 18:30:00";
        const responseData = {
            ...newScenario,
            matches_found: 10,
            matches: [
                {
                    start_time: matchStartTime,
                    end_time: matchEndTime,
                    similarity_score: 74.11
                },
                {
                    start_time: "2025-01-04 22:15:00",
                    end_time: "2025-01-05 03:15:00",
                    similarity_score: 72.53
                },
                {
                    start_time: "2025-01-14 13:15:00",
                    end_time: "2025-01-14 18:15:00",
                    similarity_score: 72.46
                }
            ],
            prediction: {
                status: "MATCH_FOUND",
                message: "A sufficiently similar historical scenario was found.",
                confidence: "MEDIUM",
                similarity: 74.11,
                historical_start_time: matchStartTime,
                historical_end_time: matchEndTime
            }
        };

        return NextResponse.json({
            success: true,
            message: "Scenario created successfully",
            data: responseData
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message || "Failed to create scenario",
            data: null
        }, { status: 500 });
    }
}
