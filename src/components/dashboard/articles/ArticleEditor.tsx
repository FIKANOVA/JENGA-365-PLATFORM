"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Camera,
    Image as ImageIcon,
    ChevronDown,
    X,
    CheckCircle2,
    XCircle,
    Loader2,
    Trash2,
    Bold,
    Italic,
    Code,
    Link2,
    Quote,
    Heading2,
    List,
} from "lucide-react";
import CoAuthorPicker from "./CoAuthorPicker";
import type { UserSearchResult } from "@/lib/actions/userSearch";

interface EditorData {
    title: string;
    content: string;
    category: string;
    tags: string[];
    excerpt: string;
    coverImageUrl: string;
    coverImageAlt: string;
    coAuthorEmails: string[];
    isFeatured: boolean;
}

interface ArticleEditorProps {
    readonly initialData?: Partial<EditorData> & {
        id?: string;
        initialCoAuthors?: readonly UserSearchResult[];
    };
    readonly onSave?: (data: EditorData) => void;
    readonly onSubmit?: (data: EditorData) => void;
    readonly onUploadCover?: (formData: FormData) => Promise<{ url: string }>;
    readonly onUploadInlineImage?: (formData: FormData) => Promise<{ url: string }>;
    readonly canFeature?: boolean;
}

const CATEGORIES = ["Rugby", "Mentorship", "Education", "Business", "Impact", "Community", "Wellness"] as const;

export default function ArticleEditor({ initialData, onSave, onSubmit, onUploadCover, onUploadInlineImage, canFeature = false }: ArticleEditorProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [category, setCategory] = useState(initialData?.category || "Mentorship");
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
    const [tagInput, setTagInput] = useState("");
    const [coAuthors, setCoAuthors] = useState<UserSearchResult[]>(
        () => (initialData?.initialCoAuthors ?? []) as UserSearchResult[],
    );
    const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
    const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || "");
    const [coverImageAlt, setCoverImageAlt] = useState(initialData?.coverImageAlt || "");
    const [uploading, setUploading] = useState(false);
    const [insertingInline, setInsertingInline] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inlineInputRef = useRef<HTMLInputElement>(null);
    const bodyRef = useRef<HTMLTextAreaElement>(null);

    const insertAtCursor = (snippet: string) => {
        const ta = bodyRef.current;
        if (!ta) {
            setContent((prev) => (prev ? prev + "\n\n" + snippet : snippet));
            return;
        }
        const start = ta.selectionStart ?? content.length;
        const end = ta.selectionEnd ?? content.length;
        const before = content.slice(0, start);
        const after = content.slice(end);
        const pad = (s: string, side: "before" | "after") => {
            if (!s) return "";
            const needs = side === "before"
                ? !s.endsWith("\n\n")
                : !s.startsWith("\n\n");
            if (!needs) return s;
            return side === "before" ? s + "\n\n" : "\n\n" + s;
        };
        const next = pad(before, "before") + snippet + pad(after, "after");
        setContent(next);
        requestAnimationFrame(() => {
            ta.focus();
            const cursor = (pad(before, "before") + snippet).length;
            ta.setSelectionRange(cursor, cursor);
        });
    };

    const wrapSelection = (prefix: string, suffix: string, placeholder = "") => {
        const ta = bodyRef.current;
        if (!ta) return;
        const start = ta.selectionStart ?? content.length;
        const end = ta.selectionEnd ?? content.length;
        const selected = content.slice(start, end) || placeholder;
        const next = content.slice(0, start) + prefix + selected + suffix + content.slice(end);
        setContent(next);
        requestAnimationFrame(() => {
            ta.focus();
            const cursorStart = start + prefix.length;
            const cursorEnd = cursorStart + selected.length;
            ta.setSelectionRange(cursorStart, cursorEnd);
        });
    };

    const prependPerLine = (token: string) => {
        const ta = bodyRef.current;
        if (!ta) return;
        const start = ta.selectionStart ?? content.length;
        const end = ta.selectionEnd ?? content.length;
        const lineStart = content.lastIndexOf("\n", start - 1) + 1;
        const lineEndIdx = content.indexOf("\n", end);
        const actualEnd = lineEndIdx === -1 ? content.length : lineEndIdx;
        const block = content.slice(lineStart, actualEnd);
        const transformed = block.split("\n").map((l) => `${token}${l}`).join("\n");
        const next = content.slice(0, lineStart) + transformed + content.slice(actualEnd);
        setContent(next);
        requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(lineStart, lineStart + transformed.length);
        });
    };

    const insertLink = () => {
        const ta = bodyRef.current;
        if (!ta) return;
        const start = ta.selectionStart ?? content.length;
        const end = ta.selectionEnd ?? content.length;
        const selected = content.slice(start, end) || "link text";
        const url = window.prompt("Link URL:", "https://") ?? "";
        if (!url || url === "https://") return;
        const snippet = `[${selected}](${url})`;
        const next = content.slice(0, start) + snippet + content.slice(end);
        setContent(next);
        requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(start + 1, start + 1 + selected.length);
        });
    };

    const handleInlineImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (!onUploadInlineImage) {
            alert("Inline image upload not configured");
            return;
        }
        setInsertingInline(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const result = await onUploadInlineImage(formData);
            const alt = window.prompt("Image description (alt text):", "") ?? "";
            insertAtCursor(`![${alt}](${result.url})`);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setInsertingInline(false);
        }
    };

    const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // allow re-uploading the same file
        if (!file) return;
        if (!onUploadCover) {
            alert("Upload not configured");
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const result = await onUploadCover(formData);
            setCoverImageUrl(result.url);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const coAuthorEmails = coAuthors.map((u) => u.email).filter(Boolean);

    const editorData: EditorData = {
        title, content, category, tags, excerpt, coverImageUrl, coverImageAlt,
        coAuthorEmails, isFeatured,
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const checklist = [
        { ok: title.length > 5,        label: "Title defined" },
        { ok: tags.length > 0,         label: "At least 1 tag" },
        { ok: excerpt.length > 20,     label: "Excerpt provided" },
        { ok: content.length > 100,    label: "Minimum content met" },
    ];

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            <header className="flex items-center justify-between border-b border-border px-6 lg:px-10 py-4 shrink-0 bg-background sticky top-0 z-50">
                <Link
                    href="/dashboard/articles"
                    className="inline-flex items-center gap-2 text-label font-medium"
                    style={{ color: "var(--brand-red)" }}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to my articles
                </Link>
                <div className="flex items-center gap-4 lg:gap-8">
                    <div className="flex gap-2">
                        <button
                            onClick={() => onSave?.(editorData)}
                            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                        >
                            Save draft
                        </button>
                        <button
                            onClick={() => onSubmit?.(editorData)}
                            className="inline-flex h-10 items-center gap-2 rounded-md px-4 text-label font-medium text-white transition-opacity hover:opacity-90"
                            style={{ background: "var(--brand-red)" }}
                        >
                            Submit for review
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-[1400px] mx-auto w-full h-full flex flex-col lg:flex-row">
                    <main className="flex-1 flex flex-col px-6 lg:px-12 py-12 lg:border-r border-border pb-32">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            onChange={handleCoverFileChange}
                            className="hidden"
                            aria-label="Cover image file picker"
                        />
                        {coverImageUrl ? (
                            <div className="mb-10 space-y-3">
                                <div
                                    className="relative w-full rounded-lg overflow-hidden border border-border"
                                    style={{ aspectRatio: "16 / 9", background: "var(--surface-1)" }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={coverImageUrl}
                                        alt={coverImageAlt || "Article cover"}
                                        className="w-full h-full object-cover"
                                    />
                                    {uploading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                    <input
                                        value={coverImageAlt}
                                        onChange={(e) => setCoverImageAlt(e.target.value)}
                                        placeholder="Alt text (describe the image for screen readers)"
                                        className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-body-sm text-foreground placeholder:text-[var(--foreground-subtle)] focus:border-[color:var(--brand-red)] focus:outline-none"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)] disabled:opacity-50"
                                        >
                                            Replace
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setCoverImageUrl(""); setCoverImageAlt(""); }}
                                            disabled={uploading}
                                            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-label text-foreground transition-colors hover:bg-[color:var(--brand-red-soft,#FEE2E2)] hover:text-[color:var(--brand-red)] disabled:opacity-50"
                                            aria-label="Remove cover image"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="group mb-10 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-[color:var(--surface-1)] px-8 py-14 transition-colors hover:border-[color:var(--brand-red)] hover:bg-background disabled:opacity-60"
                            >
                                {uploading ? (
                                    <Loader2 className="h-8 w-8 text-[var(--foreground-subtle)] animate-spin" />
                                ) : (
                                    <Camera className="h-8 w-8 text-[var(--foreground-subtle)] transition-colors group-hover:text-[color:var(--brand-red)]" />
                                )}
                                <div className="text-center">
                                    <p className="text-body font-medium text-foreground">
                                        {uploading ? "Uploading…" : "Upload cover image"}
                                    </p>
                                    <p className="text-eyebrow text-foreground-muted">
                                        16:9 recommended · JPEG / PNG / WebP · max 7MB
                                    </p>
                                </div>
                            </button>
                        )}

                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-transparent border-0 border-b-2 border-border px-0 py-3 text-display-md text-foreground placeholder:text-[var(--foreground-subtle)] focus:outline-none focus:border-[color:var(--brand-red)] transition-colors mb-8"
                            placeholder="Article title"
                            type="text"
                        />

                        <input
                            ref={inlineInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            onChange={handleInlineImageChange}
                            className="hidden"
                            aria-label="Inline image file picker"
                        />
                        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 py-2 mb-6 bg-background border-b border-border">
                            <button
                                type="button"
                                aria-label="Bold"
                                title="Bold (**text**)"
                                onClick={() => wrapSelection("**", "**", "bold text")}
                                className="p-2 text-foreground-muted hover:bg-[color:var(--surface-2)] rounded-md transition-colors"
                            >
                                <Bold className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                aria-label="Italic"
                                title="Italic (*text*)"
                                onClick={() => wrapSelection("*", "*", "italic text")}
                                className="p-2 text-foreground-muted hover:bg-[color:var(--surface-2)] rounded-md transition-colors"
                            >
                                <Italic className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                aria-label="Inline code"
                                title="Inline code (`text`)"
                                onClick={() => wrapSelection("`", "`", "code")}
                                className="p-2 text-foreground-muted hover:bg-[color:var(--surface-2)] rounded-md transition-colors"
                            >
                                <Code className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                aria-label="Link"
                                title="Link"
                                onClick={insertLink}
                                className="p-2 text-foreground-muted hover:bg-[color:var(--surface-2)] rounded-md transition-colors"
                            >
                                <Link2 className="h-4 w-4" />
                            </button>
                            <span className="w-px h-5 bg-border mx-1" aria-hidden />
                            <button
                                type="button"
                                aria-label="Heading"
                                title="Heading (#)"
                                onClick={() => prependPerLine("# ")}
                                className="p-2 text-foreground-muted hover:bg-[color:var(--surface-2)] rounded-md transition-colors"
                            >
                                <Heading2 className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                aria-label="Quote"
                                title="Blockquote (>)"
                                onClick={() => prependPerLine("> ")}
                                className="p-2 text-foreground-muted hover:bg-[color:var(--surface-2)] rounded-md transition-colors"
                            >
                                <Quote className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                aria-label="Bullet list"
                                title="Bullet list (-)"
                                onClick={() => prependPerLine("- ")}
                                className="p-2 text-foreground-muted hover:bg-[color:var(--surface-2)] rounded-md transition-colors"
                            >
                                <List className="h-4 w-4" />
                            </button>
                            <span className="w-px h-5 bg-border mx-1" aria-hidden />
                            <button
                                type="button"
                                aria-label="Insert image"
                                title="Insert image"
                                onClick={() => inlineInputRef.current?.click()}
                                disabled={insertingInline}
                                className="inline-flex items-center gap-1.5 px-2 py-1.5 text-foreground-muted hover:bg-[color:var(--surface-2)] rounded-md transition-colors disabled:opacity-50"
                            >
                                {insertingInline ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ImageIcon className="h-4 w-4" />
                                )}
                                <span className="text-eyebrow">
                                    {insertingInline ? "Uploading…" : "Image"}
                                </span>
                            </button>
                        </div>

                        <textarea
                            ref={bodyRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full flex-1 bg-transparent border-0 px-0 py-2 text-body-lg text-foreground placeholder:text-[var(--foreground-subtle)] focus:outline-none resize-none leading-relaxed min-h-[400px]"
                            placeholder="Start writing your story..."
                        />

                        <div className="mt-6 py-3 border-t border-border flex justify-between items-center">
                            <div className="flex items-center gap-2 text-body-sm" style={{ color: content.length > 100 ? "var(--brand-green)" : "var(--foreground-muted)" }}>
                                <CheckCircle2 className="h-4 w-4" />
                                {content.length > 100 ? "Minimum word count met" : "Keep writing"}
                            </div>
                            <span className="text-eyebrow text-foreground-muted">
                                {content.split(/\s+/).filter(Boolean).length} words
                            </span>
                        </div>
                    </main>

                    <aside className="w-full lg:w-[380px] shrink-0 p-8 lg:p-10 overflow-y-auto border-t lg:border-t-0 lg:border-l border-border" style={{ background: "var(--surface-1)" }}>
                        <h3 className="text-eyebrow mb-8" style={{ color: "var(--brand-red)" }}>
                            Article settings
                        </h3>

                        <div className="mb-8 space-y-2">
                            <label className="text-label text-foreground">Category</label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full appearance-none rounded-md border border-border bg-background px-3 py-2 text-body-sm text-foreground focus:border-[color:var(--brand-red)] focus:outline-none cursor-pointer"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none h-4 w-4 text-foreground-muted" />
                            </div>
                        </div>

                        <div className="mb-8 space-y-2">
                            <label className="text-label text-foreground">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-background text-body-sm text-foreground">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`} className="text-foreground-muted hover:text-foreground transition-colors">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-body-sm text-foreground placeholder:text-[var(--foreground-subtle)] focus:border-[color:var(--brand-red)] focus:outline-none"
                                placeholder="Add tag and press Enter"
                                type="text"
                            />
                        </div>

                        <div className="mb-8 space-y-2">
                            <div className="flex justify-between items-baseline">
                                <label className="text-label text-foreground">Excerpt</label>
                                <span className="text-eyebrow text-foreground-muted">{excerpt.length} / 300</span>
                            </div>
                            <textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                maxLength={300}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-body-sm text-foreground placeholder:text-[var(--foreground-subtle)] focus:border-[color:var(--brand-red)] focus:outline-none resize-none h-28"
                                placeholder="A brief summary for previews…"
                            />
                        </div>

                        <div className="mb-8 space-y-2">
                            <label className="text-label text-foreground">Co-authors</label>
                            <CoAuthorPicker
                                selected={coAuthors}
                                onChange={setCoAuthors}
                                maxCount={5}
                            />
                            <p className="text-eyebrow text-foreground-muted">
                                Up to 5 collaborators. They'll receive approval / rejection notifications too.
                            </p>
                        </div>

                        {canFeature && (
                            <div className="mb-8">
                                <label className="flex items-start gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                        className="mt-1 h-4 w-4 accent-[color:var(--brand-red)] cursor-pointer"
                                    />
                                    <div className="space-y-0.5">
                                        <p className="text-label text-foreground">Featured article</p>
                                        <p className="text-eyebrow text-foreground-muted">
                                            Pins this on the articles homepage. Moderator/admin only.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        )}

                        <div className="pt-6 border-t border-border">
                            <h4 className="text-eyebrow text-foreground mb-4">Submission checklist</h4>
                            <ul className="space-y-2.5">
                                {checklist.map((item) => (
                                    <li key={item.label} className="flex items-start gap-2.5 text-body-sm text-foreground-muted">
                                        {item.ok
                                            ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--brand-green)" }} />
                                            : <XCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--brand-red)" }} />}
                                        {item.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
