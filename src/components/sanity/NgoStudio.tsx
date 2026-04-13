"use client";

import { NextStudio } from "next-sanity/studio";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { articleType } from "@/sanity/schemaTypes/articleType";
import { authorType } from "@/sanity/schemaTypes/authorType";
import { eventType } from "@/sanity/schemaTypes/eventType";
import { eventCommentType } from "@/sanity/schemaTypes/eventCommentType";
import { speakerType } from "@/sanity/schemaTypes/speakerType";
import { apiVersion, dataset, projectId } from "@/sanity/env";

/**
 * Scoped Sanity Studio for NGO Partners.
 * Document types exposed: Articles, Events (read + comment), Event Comments.
 * Product/commerce/partner carousel types are intentionally excluded.
 */
interface NgoStudioProps {
    basePath: string;
}

export function NgoStudio({ basePath }: NgoStudioProps) {
    const config = defineConfig({
        basePath,
        projectId,
        dataset,
        schema: {
            types: [articleType, authorType, eventType, eventCommentType, speakerType],
        },
        plugins: [
            structureTool({
                title: "NGO Content",
                structure: (S) =>
                    S.list()
                        .title("NGO Content")
                        .items([
                            S.listItem()
                                .title("Articles")
                                .icon(() => "✍️")
                                .child(S.documentTypeList("article").title("Articles")),
                            S.listItem()
                                .title("Event Comments")
                                .icon(() => "💬")
                                .child(S.documentTypeList("eventComment").title("Event Comments")),
                            S.divider(),
                            S.listItem()
                                .title("Events (read-only reference)")
                                .icon(() => "📅")
                                .child(S.documentTypeList("event").title("Events")),
                        ]),
            }),
        ],
    });

    return <NextStudio config={config} />;
}
