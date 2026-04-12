"use client";

import { NextStudio } from "next-sanity/studio";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "@/sanity/schemaTypes";
import { apiVersion, dataset, projectId } from "@/sanity/env";

interface StudioProps {
    basePath: string;
}

export function Studio({ basePath }: StudioProps) {
    const config = defineConfig({
        basePath,
        projectId,
        dataset,
        schema,
        plugins: [
            structureTool({ title: "Jenga365 Content" }),
            visionTool({ defaultApiVersion: apiVersion }),
        ],
    });
    return <NextStudio config={config} />;
}
