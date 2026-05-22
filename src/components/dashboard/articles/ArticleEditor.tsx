"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Camera,
    Bold,
    Italic,
    List,
    Link2,
    Quote,
    Image as ImageIcon,
    Code,
    ChevronDown,
    X,
    CheckCircle2,
    XCircle,
} from "lucide-react";

interface ArticleEditorProps {
    readonly initialData?: any;
    readonly onSave?: (data: any) => void;
    readonly onSubmit?: (data: any) => void;
}

const TOOLBAR = [
    { Icon: Bold,      label: "Bold" },
    { Icon: Italic,    label: "Italic" },
    { Icon: List,      label: "Bullet list" },
    { Icon: Link2,     label: "Link" },
    { Icon: Quote,     label: "Quote" },
    { Icon: ImageIcon, label: "Image" },
    { Icon: Code,      label: "Code" },
];

export default function ArticleEditor({ initialData, onSave, onSubmit }: ArticleEditorProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [category, setCategory] = useState(initialData?.category || "Sports & Development");
    const [tags, setTags] = useState<string[]>(initialData?.tags || ["Mentorship", "Rugby"]);
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
    const [tagInput, setTagInput] = useState("");

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
                    href="/articles"
                    className="inline-flex items-center gap-2 text-label font-medium"
                    style={{ color: "var(--brand-red)" }}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to my articles
                </Link>
                <div className="flex items-center gap-4 lg:gap-8">
                    <span className="text-eyebrow text-foreground-muted hidden md:inline">Saved 30s ago</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onSave?.({ title, content, category, tags, excerpt })}
                            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                        >
                            Save draft
                        </button>
                        <button
                            onClick={() => onSubmit?.({ title, content, category, tags, excerpt })}
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
                        <button
                            type="button"
                            className="group mb-10 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-[color:var(--surface-1)] px-8 py-14 transition-colors hover:border-[color:var(--brand-red)] hover:bg-background"
                        >
                            <Camera className="h-8 w-8 text-[var(--foreground-subtle)] transition-colors group-hover:text-[color:var(--brand-red)]" />
                            <div className="text-center">
                                <p className="text-body font-medium text-foreground">Upload cover image</p>
                                <p className="text-eyebrow text-foreground-muted">16:9 aspect ratio recommended</p>
                            </div>
                        </button>

                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-transparent border-0 border-b-2 border-border px-0 py-3 text-display-md text-foreground placeholder:text-[var(--foreground-subtle)] focus:outline-none focus:border-[color:var(--brand-red)] transition-colors mb-8"
                            placeholder="Article title"
                            type="text"
                        />

                        <div className="sticky top-0 z-10 flex flex-wrap gap-1 py-2 mb-6 bg-background border-b border-border">
                            {TOOLBAR.map(({ Icon, label }) => (
                                <button
                                    key={label}
                                    type="button"
                                    aria-label={label}
                                    className="p-2 text-foreground-muted hover:bg-[color:var(--surface-2)] rounded-md transition-colors"
                                >
                                    <Icon className="h-4 w-4" />
                                </button>
                            ))}
                        </div>

                        <textarea
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
                                    <option>Sports &amp; Development</option>
                                    <option>Community</option>
                                    <option>Leadership</option>
                                    <option>Technology</option>
                                    <option>Finance</option>
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
