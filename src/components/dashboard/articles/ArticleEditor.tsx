"use client";

import { useState } from "react";
import Link from "next/link";

interface ArticleEditorProps {
    readonly initialData?: any;
    readonly onSave?: (data: any) => void;
    readonly onSubmit?: (data: any) => void;
}

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

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-slate-950 font-sans">
            {/* Editor Header */}
            <header className="flex items-center justify-between border-b border-[#E8E4DC] dark:border-slate-800 px-6 lg:px-10 py-4 shrink-0 bg-white dark:bg-slate-900 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/articles" className="text-[#BB0000] font-mono text-[10px] md:text-xs font-bold hover:underline flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        BACK TO MY ARTICLES
                    </Link>
                </div>
                <div className="flex items-center gap-4 lg:gap-8">
                    <span className="text-[#8A8A8A] font-mono text-[10px] hidden md:inline-block uppercase tracking-widest">Saved 30s ago</span>
                    <div className="flex gap-3">
                        <button
                            onClick={() => onSave?.({ title, content, category, tags, excerpt })}
                            className="flex items-center justify-center rounded border border-[#E8E4DC] dark:border-slate-700 h-10 px-5 bg-transparent text-[#1A1A1A] dark:text-white font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-[#F5F5F5] dark:hover:bg-slate-800 transition-colors"
                        >
                            SAVE DRAFT
                        </button>
                        <button
                            onClick={() => onSubmit?.({ title, content, category, tags, excerpt })}
                            className="flex items-center justify-center rounded h-10 px-5 bg-[#BB0000] text-white font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-[#8B0000] transition-colors shadow-lg"
                        >
                            SUBMIT FOR REVIEW <span className="material-symbols-outlined text-sm ml-2">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-[1400px] mx-auto w-full h-full flex flex-col lg:flex-row">
                    {/* Writing Area */}
                    <main className="flex-1 flex flex-col px-6 lg:px-16 py-12 lg:border-r border-[#E8E4DC] dark:border-slate-800 pb-32">
                        {/* Cover Upload */}
                        <div className="mb-12">
                            <div className="group flex flex-col items-center justify-center gap-4 rounded border-2 border-dashed border-[#D0CBC0] dark:border-slate-700 px-8 py-16 bg-[#FBFBF9] dark:bg-slate-900/50 cursor-pointer hover:border-[#BB0000] hover:bg-white dark:hover:bg-slate-900 transition-all">
                                <span className="material-symbols-outlined text-5xl text-[#D0CBC0] group-hover:text-[#BB0000] transition-colors">photo_camera</span>
                                <div className="text-center">
                                    <p className="text-[#1A1A1A] dark:text-white font-bold text-lg mb-1">Upload Cover Image</p>
                                    <p className="text-[#8A8A8A] text-sm font-mono uppercase tracking-widest">16:9 Aspect Ratio recommended</p>
                                </div>
                            </div>
                        </div>

                        {/* Title Input */}
                        <div className="mb-10">
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent border-0 border-b-2 border-[#E8E4DC] dark:border-slate-800 px-0 py-4 text-4xl md:text-5xl font-serif font-black text-[#1A1A1A] dark:text-white placeholder:text-[#D0CBC0] dark:placeholder:text-slate-800 focus:ring-0 focus:border-[#BB0000] transition-all"
                                placeholder="Article Title"
                                type="text"
                            />
                        </div>

                        {/* Toolbar */}
                        <div className="sticky top-0 z-10 flex flex-wrap gap-1 py-3 mb-8 bg-white dark:bg-slate-950 border-b border-[#E8E4DC] dark:border-slate-800">
                            {['format_bold', 'format_italic', 'format_list_bulleted', 'link', 'format_quote', 'image', 'code'].map((icon) => (
                                <button key={icon} className="p-2 text-[#4A4A4A] dark:text-slate-400 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 rounded transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                                </button>
                            ))}
                        </div>

                        {/* Body Area */}
                        <div className="flex-1 flex flex-col relative min-h-[500px]">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full flex-1 bg-transparent border-0 px-0 py-2 text-xl text-[#1A1A1A] dark:text-slate-200 placeholder:text-[#D0CBC0] focus:ring-0 resize-none font-body leading-[1.8]"
                                placeholder="Start writing your story..."
                            />
                        </div>

                        {/* Footer Stats */}
                        <div className="mt-8 py-4 border-t border-[#E8E4DC] dark:border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-green-600 font-mono text-[10px] font-bold uppercase tracking-widest">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Minimum word count met
                            </div>
                            <span className="text-[#8A8A8A] font-mono text-[10px]">{content.split(/\s+/).filter(Boolean).length} WORDS</span>
                        </div>
                    </main>

                    {/* Sidebar Settings */}
                    <aside className="w-full lg:w-[380px] shrink-0 bg-[#FBFBF9] dark:bg-slate-900/30 p-8 lg:p-12 overflow-y-auto lg:sticky lg:top-[73px] h-fit lg:min-h-[calc(100vh-73px)] border-t lg:border-t-0 lg:border-l border-[#E8E4DC] dark:border-slate-800">
                        <h3 className="text-[#BB0000] font-mono text-[11px] font-black tracking-[0.2em] mb-10 uppercase">Article Settings</h3>

                        {/* Category */}
                        <div className="mb-10">
                            <label className="block text-[#1A1A1A] dark:text-white font-bold text-xs uppercase tracking-widest mb-3 font-mono">Category</label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full appearance-none rounded border border-[#D0CBC0] dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-[#1A1A1A] dark:text-slate-200 focus:border-[#BB0000] focus:ring-0 font-body cursor-pointer shadow-sm"
                                >
                                    <option>Sports & Development</option>
                                    <option>Community</option>
                                    <option>Leadership</option>
                                    <option>Technology</option>
                                    <option>Finance</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8A8A8A]">expand_more</span>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="mb-10">
                            <label className="block text-[#1A1A1A] dark:text-white font-bold text-xs uppercase tracking-widest mb-3 font-mono">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white dark:bg-slate-800 text-[#BB0000] text-[10px] font-mono font-bold border border-[#BB0000]/20 shadow-sm">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                className="w-full rounded border border-[#D0CBC0] dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-[#1A1A1A] dark:text-slate-200 focus:border-[#BB0000] focus:ring-0 font-body placeholder:text-[#D0CBC0] shadow-sm"
                                placeholder="Add tag and press Enter..."
                                type="text"
                            />
                        </div>

                        {/* Excerpt */}
                        <div className="mb-10">
                            <div className="flex justify-between items-baseline mb-3">
                                <label className="block text-[#1A1A1A] dark:text-white font-bold text-xs uppercase tracking-widest font-mono">Excerpt</label>
                                <span className="text-[#8A8A8A] font-mono text-[9px] uppercase">{excerpt.length} / 300</span>
                            </div>
                            <textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                maxLength={300}
                                className="w-full rounded border border-[#D0CBC0] dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-[#1A1A1A] dark:text-slate-200 focus:border-[#BB0000] focus:ring-0 resize-none h-32 font-body leading-relaxed shadow-sm"
                                placeholder="A brief summary for previews..."
                            />
                        </div>

                        {/* Submission Checklist */}
                        <div className="pt-8 border-t border-[#E8E4DC] dark:border-slate-800">
                            <h4 className="text-[#1A1A1A] dark:text-white font-black text-xs mb-6 uppercase tracking-widest font-mono">SUBMISSION CHECKLIST</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <span className={`material-symbols-outlined text-[18px] mt-0.5 ${title.length > 5 ? 'text-green-600' : 'text-[#BB0000]'}`}>
                                        {title.length > 5 ? 'check_circle' : 'cancel'}
                                    </span>
                                    <span className="text-xs font-mono uppercase tracking-wider text-[#4A4A4A] dark:text-slate-400">Title defined</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className={`material-symbols-outlined text-[18px] mt-0.5 ${tags.length > 0 ? 'text-green-600' : 'text-[#BB0000]'}`}>
                                        {tags.length > 0 ? 'check_circle' : 'cancel'}
                                    </span>
                                    <span className="text-xs font-mono uppercase tracking-wider text-[#4A4A4A] dark:text-slate-400">At least 1 tag</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className={`material-symbols-outlined text-[18px] mt-0.5 ${excerpt.length > 20 ? 'text-green-600' : 'text-[#BB0000]'}`}>
                                        {excerpt.length > 20 ? 'check_circle' : 'cancel'}
                                    </span>
                                    <span className="text-xs font-mono uppercase tracking-wider text-[#4A4A4A] dark:text-slate-400">Excerpt provided</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className={`material-symbols-outlined text-[18px] mt-0.5 ${content.length > 100 ? 'text-green-600' : 'text-[#BB0000]'}`}>
                                        {content.length > 100 ? 'check_circle' : 'cancel'}
                                    </span>
                                    <span className="text-xs font-mono uppercase tracking-wider text-[#4A4A4A] dark:text-slate-400">Minimum content met</span>
                                </li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
