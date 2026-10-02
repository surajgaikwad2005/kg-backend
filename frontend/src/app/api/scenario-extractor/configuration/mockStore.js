// In-memory mock store for Scenario Extractor configurations
const initialScenarios = [
    {
        scenario_id: 59201808,
        scenario_name: "High Flow Scenario",
        asset: "U1300",
        tags: ["1300FI005.pv", "1300FFI007.pv"],
        start_time: "2025-12-01 10:00:00",
        end_time: "2025-12-01 18:00:00",
        pattern_window: 33,
        similarity_threshold: 70,
        weights: {
            "1300FI005.pv": 1,
            "1300FFI007.pv": 1
        },
        created_at: "2026-08-27T04:43:58.334776"
    },
    {
        scenario_id: 54661905,
        scenario_name: "demo",
        asset: "U1300",
        tags: ["1300FI005.pv", "1300FFI007.pv"],
        start_time: "2025-12-10 10:00:00",
        end_time: "2025-12-10 15:00:00",
        pattern_window: 21,
        similarity_threshold: 70,
        weights: {
            "1300FI005.pv": 1,
            "1300FFI007.pv": 1
        },
        created_at: "2026-08-27T04:35:59.595038"
    },
    {
        scenario_id: 52807802,
        scenario_name: "Demo",
        asset: "U1300",
        tags: ["1300FI005.pv", "1300FFI007.pv"],
        start_time: "2025-12-10 10:00:00",
        end_time: "2025-12-10 15:00:00",
        pattern_window: 21,
        similarity_threshold: 70,
        weights: {
            "1300FI005.pv": 1,
            "1300FFI007.pv": 1
        },
        created_at: "2026-08-27T04:32:44.029372"
    },
    {
        scenario_id: 39147833,
        scenario_name: "Test123",
        asset: "U1300",
        tags: ["2300FC312A.PV", "2300FC312B.PV"],
        start_time: "2025-12-10 10:00:00",
        end_time: "2025-12-11 10:00:00",
        pattern_window: 97,
        similarity_threshold: 70,
        weights: {
            "2300FC312A.PV": 1,
            "2300FC312B.PV": 1
        },
        created_at: "2026-08-27T04:11:10.017065"
    },
    {
        scenario_id: 35693774,
        scenario_name: "Test1",
        asset: "U1300",
        tags: ["2300FC312A.PV", "2300FC312B.PV"],
        start_time: "2025-12-10 10:00:00",
        end_time: "2025-12-10 15:00:00",
        pattern_window: 21,
        similarity_threshold: 70,
        weights: {
            "2300FC312A.PV": 1,
            "2300FC312B.PV": 1
        },
        created_at: "2026-08-27T04:05:23.819872"
    },
    {
        scenario_id: 25324613,
        scenario_name: "Test",
        asset: "U1300",
        tags: ["2300FC312A.PV", "2300FC312B.PV"],
        start_time: "2025-12-10 10:00:00",
        end_time: "2025-12-10 15:00:00",
        pattern_window: 97,
        similarity_threshold: 70,
        weights: {
            "2300FC312A.PV": 1,
            "2300FC312B.PV": 1
        },
        created_at: "2026-08-27T03:48:03.859375"
    }
];

if (!global._mockScenarios) {
    global._mockScenarios = [...initialScenarios];
}

export const mockStore = {
    getScenarios: () => global._mockScenarios,
    
    getScenario: (id) => global._mockScenarios.find(s => s.scenario_id === Number(id)),
    
    addScenario: (scenario) => {
        const id = Math.floor(10000000 + Math.random() * 90000000);
        const newScenario = {
            ...scenario,
            scenario_id: id,
            pattern_window: scenario.pattern_window || 21,
            weights: scenario.tags.reduce((acc, tag) => {
                acc[tag] = 1;
                return acc;
            }, {}),
            created_at: new Date().toISOString()
        };
        global._mockScenarios = [newScenario, ...global._mockScenarios];
        return newScenario;
    },
    
    updateScenario: (id, updatedFields) => {
        let found = null;
        global._mockScenarios = global._mockScenarios.map(s => {
            if (s.scenario_id === Number(id)) {
                found = {
                    ...s,
                    ...updatedFields,
                    weights: updatedFields.tags ? updatedFields.tags.reduce((acc, tag) => {
                        acc[tag] = 1;
                        return acc;
                    }, {}) : s.weights
                };
                return found;
            }
            return s;
        });
        return found;
    },
    
    deleteScenario: (id) => {
        const exists = global._mockScenarios.some(s => s.scenario_id === Number(id));
        if (exists) {
            global._mockScenarios = global._mockScenarios.filter(s => s.scenario_id !== Number(id));
            return true;
        }
        return false;
    }
};
