import { createProxy } from "@/src/app/api/_lib/proxy";

export const { POST } = createProxy({
    backend: "PLANT_GPT",
    path: "/plantGpt",
});
