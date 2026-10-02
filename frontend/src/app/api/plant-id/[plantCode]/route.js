import { createProxy } from "@/src/app/api/_lib/proxy";

// DELETE → purge/remove a plant (admin only). cascade + confirm travel as query params.
export const { DELETE } = createProxy({
    backend: "PLANT_CODE_ID",
    path: ({ plantCode }) => `/plants/${plantCode}`,
    methods: ["DELETE"],
});
