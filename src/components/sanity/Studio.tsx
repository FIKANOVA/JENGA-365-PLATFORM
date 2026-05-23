"use client";

import { NextStudio } from "next-sanity/studio";
import { defineConfig, type DocumentActionComponent } from "sanity";
import { structureTool, type StructureBuilder } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "@/sanity/schemaTypes";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import type { EffectiveRole } from "@/lib/sanity/roleAccess";
import { ServerPublishAction } from "./actions/serverPublishAction";
import { ServerDeleteAction } from "./actions/serverDeleteAction";

interface StudioProps {
    readonly basePath: string;
    readonly allowedSchemaTypes?: string[];
    readonly enableVision?: boolean;
    readonly currentUserId: string;
    readonly currentUserRole: EffectiveRole;
}

const PRIVILEGED_ROLES: EffectiveRole[] = ["SuperAdmin", "Moderator"];

// Actions hidden from non-privileged roles on the `article` schema.
// Server-side `requireCapability("PUBLISH_ARTICLE")` remains the source of truth.
const GATED_ARTICLE_ACTIONS = new Set(["publish", "unpublish", "delete", "duplicate"]);

export function Studio({
    basePath,
    allowedSchemaTypes,
    enableVision = true,
    currentUserId,
    currentUserRole,
}: StudioProps) {
    const isPrivileged = PRIVILEGED_ROLES.includes(currentUserRole);
    const ownsArticlesOnly = currentUserRole === "Mentor" || currentUserRole === "Mentee";

    const buildStructure = (S: StructureBuilder) => {
        const visibleNames =
            allowedSchemaTypes ?? schema.types.map((t) => t.name);

        const articleNodes = ownsArticlesOnly
            ? [
                S.listItem()
                    .id("my-articles")
                    .title("My articles")
                    .schemaType("article")
                    .child(
                        S.documentList()
                            .title("My articles")
                            .schemaType("article")
                            .filter('_type == "article" && author->userId == $uid')
                            .params({ uid: currentUserId })
                            .canHandleIntent(
                                (intent, params) =>
                                    intent === "create" && params.type === "article",
                            ),
                    ),
            ]
            : [
                // Split the article list so moderators can triage in-app
                // submissions (deterministic article-jenga-* IDs) separately
                // from articles authored directly in Studio.
                S.listItem()
                    .id("articles-from-app")
                    .title("Articles · in-app submissions")
                    .schemaType("article")
                    .child(
                        S.documentList()
                            .id("articles-from-app-list")
                            .title("In-app submissions")
                            .schemaType("article")
                            .filter('_type == "article" && (_id match "article-jenga-*" || _id match "drafts.article-jenga-*")')
                            .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
                    ),
                S.listItem()
                    .id("articles-studio")
                    .title("Articles · authored in Studio")
                    .schemaType("article")
                    .child(
                        S.documentList()
                            .id("articles-studio-list")
                            .title("Studio-authored articles")
                            .schemaType("article")
                            .filter('_type == "article" && !(_id match "article-jenga-*") && !(_id match "drafts.article-jenga-*")')
                            .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
                    ),
            ];

        return S.list()
            .title("Content")
            .items(
                visibleNames.flatMap((name) => {
                    if (name === "article") return articleNodes;
                    return [S.documentTypeListItem(name)];
                }),
            );
    };

    const config = defineConfig({
        basePath,
        projectId,
        dataset,
        schema,
        document: {
            actions: (prev, ctx): DocumentActionComponent[] => {
                if (ctx.schemaType !== "article") return prev;

                // Non-privileged roles: hide all dangerous actions entirely.
                if (!isPrivileged) {
                    return prev.filter(
                        (action) =>
                            !GATED_ARTICLE_ACTIONS.has(action.action ?? ""),
                    );
                }

                // Privileged roles: replace Sanity's default publish/delete with
                // server-action-backed versions that check capabilities, mirror
                // status to Neon, and write a moderation_log entry.
                return prev.map((action) => {
                    if (action.action === "publish") return ServerPublishAction;
                    if (action.action === "delete") return ServerDeleteAction;
                    return action;
                });
            },
        },
        plugins: [
            structureTool({
                title: "Jenga365 Content",
                structure: buildStructure,
            }),
            ...(enableVision
                ? [visionTool({ defaultApiVersion: apiVersion })]
                : []),
        ],
    });
    return <NextStudio config={config} />;
}
