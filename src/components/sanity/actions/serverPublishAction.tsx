"use client";

import { useState } from "react";
import type { DocumentActionComponent, DocumentActionProps } from "sanity";
import { useToast } from "@sanity/ui";
import { publishArticleViaStudio } from "@/lib/actions/articleStudio";

export const ServerPublishAction: DocumentActionComponent = (props: DocumentActionProps) => {
    const [busy, setBusy] = useState(false);
    const toast = useToast();

    return {
        label: busy ? "Publishing…" : "Publish",
        tone: "positive",
        disabled: busy || (!props.draft && props.published?.status === "published"),
        onHandle: async () => {
            setBusy(true);
            try {
                const result = await publishArticleViaStudio(props.id);
                toast.push({
                    status: "success",
                    title: "Article published",
                    description: result.publishedId,
                });
                props.onComplete();
            } catch (err) {
                const message = err instanceof Error ? err.message : "Publish failed";
                toast.push({
                    status: "error",
                    title: message.startsWith("FORBIDDEN")
                        ? "You don't have permission to publish"
                        : "Publish failed",
                    description: message,
                });
                setBusy(false);
            }
        },
    };
};
