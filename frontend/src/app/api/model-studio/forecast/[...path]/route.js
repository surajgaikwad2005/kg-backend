import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

// Forwards /api/model-studio/forecast/* → <MODEL_FACTORY>/forecasting/*
export const { GET, POST, PUT, DELETE } = createCatchAllProxy({
    backend: "MODEL_FACTORY",
    prefix: "/forecasting",
    methods: ["GET", "POST", "PUT", "DELETE"],
    trailingSlash: false,
});
