import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

// Forwards /api/workspace/* → <WORKSPACE backend>/p1/workspace/*
// The /p1/workspace prefix is owned by BACKEND_PATHS.WORKSPACE (bundled with
// the decisionops-pod1 gateway mount), so no prefix is set here — segments
// map straight through (e.g. /api/workspace/listWorkspaces →
// .../p1/workspace/listWorkspaces).
export const { GET, POST, DELETE } = createCatchAllProxy({
    backend: "WORKSPACE",
    methods: ["GET", "POST", "DELETE"],
    trailingSlash: false,
});
