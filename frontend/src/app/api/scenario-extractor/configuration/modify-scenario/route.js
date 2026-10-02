import { NextResponse } from 'next/server';
import { mockStore } from '../mockStore';

export async function PUT(request) {
    try {
        const body = await request.json();
        
        if (!body.scenario_id) {
            return NextResponse.json({
                success: false,
                message: "Missing scenario_id in request body",
                data: null
            }, { status: 400 });
        }

        const updated = mockStore.updateScenario(body.scenario_id, {
            scenario_name: body.scenario_name,
            asset: body.asset,
            tags: body.tags,
            start_time: body.start_time,
            end_time: body.end_time,
            similarity_threshold: Number(body.similarity_threshold) || undefined,
            plant_code_id: body.plant_code_id,
            pattern_window: body.pattern_window
        });

        if (!updated) {
            return NextResponse.json({
                success: false,
                message: `Scenario with ID ${body.scenario_id} not found`,
                data: null
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Scenario modified successfully",
            data: {
                scenario_id: updated.scenario_id
            }
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message || "Failed to modify scenario",
            data: null
        }, { status: 500 });
    }
}
