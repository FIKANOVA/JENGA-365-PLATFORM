"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { deleteSelfAccountAction } from "@/lib/actions/settings";
import { signOut } from "@/lib/auth/client";

export default function DangerZoneSection() {
    const router = useRouter();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [confirmDeleteText, setConfirmDeleteText] = useState("");
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    async function handleDeleteAccount() {
        if (confirmDeleteText !== "DELETE MY ACCOUNT") {
            setDeleteError("Please type DELETE MY ACCOUNT to confirm.");
            return;
        }
        setDeletingAccount(true);
        setDeleteError(null);
        try {
            const res = await deleteSelfAccountAction();
            if (res.success) {
                await signOut();
                router.push("/login?deleted=true");
            } else {
                setDeleteError(res.error || "Failed to delete account.");
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong.";
            setDeleteError(message);
        } finally {
            setDeletingAccount(false);
        }
    }

    return (
        <section className="border border-destructive/40 rounded-md bg-destructive/5 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div>
                    <h2 className="text-headline text-destructive font-bold">Danger Zone: Delete Account</h2>
                    <p className="text-body-sm text-foreground-muted mt-1">
                        Permanently delete your account and remove all personal data associated with it. This action cannot be undone.
                    </p>
                </div>
            </div>

            {!deleteModalOpen ? (
                <button
                    type="button"
                    onClick={() => setDeleteModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground text-sm font-medium rounded-md hover:bg-destructive/90 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                </button>
            ) : (
                <div className="p-4 border border-destructive/30 rounded-md bg-background space-y-4">
                    <p className="text-body-sm text-destructive font-semibold">
                        Are you absolutely sure? To confirm deletion, type <span className="font-mono bg-destructive/10 px-1 py-0.5 rounded">DELETE MY ACCOUNT</span> below:
                    </p>

                    {deleteError && (
                        <div className="p-3 text-xs bg-destructive/10 border border-destructive/30 text-destructive rounded-md">
                            {deleteError}
                        </div>
                    )}

                    <input
                        type="text"
                        value={confirmDeleteText}
                        onChange={(e) => setConfirmDeleteText(e.target.value)}
                        placeholder="DELETE MY ACCOUNT"
                        className="w-full h-10 px-3 rounded-md border border-border bg-background text-body-sm text-foreground font-mono"
                    />

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleDeleteAccount}
                            disabled={deletingAccount || confirmDeleteText !== "DELETE MY ACCOUNT"}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground text-sm font-bold rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            {deletingAccount ? "Deleting…" : "Permanently Delete Account"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setConfirmDeleteText("");
                                setDeleteError(null);
                            }}
                            className="px-4 py-2 text-sm text-foreground-muted hover:text-foreground"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
