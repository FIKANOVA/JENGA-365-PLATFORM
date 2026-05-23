"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "@/sanity/schemaTypes";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const SINGLETON_TYPES = new Set(["siteSettings"]);

export default defineConfig({
    basePath: "/dashboard/admin/studio",
    projectId,
    dataset,
    schema,
    plugins: [
        structureTool({
            title: "Jenga365 Content",
            structure: (S) =>
                S.list()
                    .title("Jenga365 Content")
                    .items([
                        S.listItem()
                            .title("Site Settings")
                            .id("siteSettings")
                            .child(
                                S.document()
                                    .schemaType("siteSettings")
                                    .documentId("siteSettings")
                            ),
                        S.divider(),
                        ...S.documentTypeListItems().filter(
                            (item) => !SINGLETON_TYPES.has(item.getId() ?? "")
                        ),
                    ]),
        }),
        visionTool({ defaultApiVersion: apiVersion }),
    ],
    document: {
        // Hide "Create new" / "Duplicate" / "Delete" on singletons.
        actions: (prev, { schemaType }) =>
            SINGLETON_TYPES.has(schemaType)
                ? prev.filter(({ action }) => action && !["unpublish", "delete", "duplicate"].includes(action))
                : prev,
        newDocumentOptions: (prev, { creationContext }) =>
            creationContext.type === "global"
                ? prev.filter((tmpl) => !SINGLETON_TYPES.has(tmpl.templateId))
                : prev,
    },
});
