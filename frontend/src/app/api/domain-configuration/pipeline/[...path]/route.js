import { createCatchAllProxy } from "@/src/app/api/_lib/proxy";

export const { GET, POST, PATCH, PUT, DELETE } = createCatchAllProxy({
    backend: "DATA_ACTIVITY",
    prefix: "/pipeline",
    trailingSlash: false,
});
