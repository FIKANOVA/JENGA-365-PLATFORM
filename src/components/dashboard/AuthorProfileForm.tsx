"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { updateAuthorProfile } from "@/lib/actions/authorProfile";
import AvatarUpload from "@/components/shared/AvatarUpload";

interface AuthorProfileFormProps {
    readonly initialBio: string;
    readonly initialTitle: string;
    readonly initialImage?: string | null;
}

export default function AuthorProfileForm({ initialBio, initialTitle, initialImage }: AuthorProfileFormProps) {
    const [bio, setBio] = useState(initialBio);
    const [title, setTitle] = useState(initialTitle);
    const [imageUrl, setImageUrl] = useState<string | null>(initialImage || null);
    const [pending, start] = useTransition();
    const [savedAt, setSavedAt] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const dirty = bio !== initialBio || title !== initialTitle;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        start(async () => {
            try {
                await updateAuthorProfile({ bio, professionalTitle: title });
                setSavedAt(new Date());
            } catch (err) {
                setError(err instanceof Error ? err.message : "Save failed");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 pb-4 border-b border-border/60">
                <label className="text-label text-foreground block">
                    Author Photo
                </label>
                <AvatarUpload
                    currentImageUrl={imageUrl}
                    userName="Author"
                    onAvatarChange={(newUrl) => setImageUrl(newUrl)}
                    size="md"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="title" className="text-label text-foreground">
                    Professional title
                </label>
                <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={120}
                    placeholder="Mentor · Senior Software Engineer · Founder"
                    className="w-full h-10 rounded-md border border-border bg-background px-3 text-body-sm text-foreground placeholder:text-[var(--foreground-subtle)] focus:border-[color:var(--brand-green)] focus:outline-none"
                />
                <p className="text-eyebrow text-foreground-muted">
                    Appears as the small label beneath your name on article pages.
                </p>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                    <label htmlFor="bio" className="text-label text-foreground">Bio</label>
                    <span className="text-eyebrow text-foreground-muted">{bio.length} / 600</span>
                </div>
                <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={600}
                    rows={6}
                    placeholder="A short paragraph about your work, interests, and what readers can expect from your articles."
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-body-sm text-foreground placeholder:text-[var(--foreground-subtle)] focus:border-[color:var(--brand-green)] focus:outline-none resize-none leading-relaxed"
                />
                <p className="text-eyebrow text-foreground-muted">
                    Shown in the sidebar of every article you write. Used as fallback bio for co-authored posts too.
                </p>
            </div>

            {error && (
                <p className="text-body-sm" style={{ color: "var(--brand-red)" }}>
                    {error}
                </p>
            )}

            <div className="flex items-center justify-between border-t border-border pt-6">
                <div className="text-body-sm text-foreground-muted">
                    {savedAt ? (
                        <span className="inline-flex items-center gap-1.5" style={{ color: "var(--brand-green)" }}>
                            <CheckCircle2 className="h-4 w-4" />
                            Saved {savedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    ) : null}
                </div>
                <button
                    type="submit"
                    disabled={pending || !dirty}
                    className="inline-flex h-10 items-center gap-2 rounded-md px-4 text-label font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--brand-green)" }}
                >
                    {pending ? "Saving…" : "Save changes"}
                </button>
            </div>
        </form>
    );
}
