"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "@/sanity/schemaTypes";
import { apiVersion, dataset, projectId } from "@/sanity/env";

export default defineConfig({
    basePath: "/dashboard/admin/studio", // Default base path (Admin gets everything)
    projectId,
    dataset,
    schema,
    plugins: [
        structureTool({
            title: "Jenga365 Content",
        }),
        visionTool({ defaultApiVersion: apiVersion }),
    ],
});
