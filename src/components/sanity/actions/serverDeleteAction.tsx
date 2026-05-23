"use client";

import { useState } from "react";
import type { DocumentActionComponent, DocumentActionProps } from "sanity";
import { useToast } from "@sanity/ui";
import { deleteArticleViaStudio } from "@/lib/actions/articleStudio";

export const ServerDeleteAction: DocumentActionComponent = (props: DocumentActionProps) => {
    const [busy, setBusy] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const toast = useToast();

    return {
        label: busy ? "Deleting…" : "Delete",
        tone: "critical",
        disabled: busy,
        onHandle: () => setConfirm(true),
        dialog: confirm && {
            type: "confirm",
            tone: "critical",
            message: "This permanently deletes the article and its draft. Continue?",
            onCancel: () => setConfirm(false),
            onConfirm: async () => {
                setConfirm(false);
                setBusy(true);
                try {
                    const result = await deleteArticleViaStudio(props.id);
                    toast.push({
                        status: "success",
                        title: "Article deleted",
                        description: result.deletedId,
                    });
                    props.onComplete();
                } catch (err) {
                    const message = err instanceof Error ? err.message : "Delete failed";
                    toast.push({
                        status: "error",
                        title: message.startsWith("FORBIDDEN")
                            ? "You don't have permission to delete"
                            : "Delete failed",
                        description: message,
                    });
                    setBusy(false);
                }
            },
        },
    };
};
