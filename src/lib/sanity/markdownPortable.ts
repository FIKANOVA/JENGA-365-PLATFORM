import { sanityImageRefFromUrl } from "./imageRef";

// ── Types (slim) ─────────────────────────────────────────────────────────────
interface MarkDef {
    _key: string;
    _type: "link";
    href: string;
}
interface Span {
    _type: "span";
    _key: string;
    text: string;
    marks: string[];
}
interface TextBlock {
    _type: "block";
    _key: string;
    style: "normal" | "h2" | "h3" | "h4" | "blockquote";
    listItem?: "bullet";
    level?: number;
    markDefs: MarkDef[];
    children: Span[];
}
interface ImageBlock {
    _type: "image";
    _key: string;
    asset: { _type: "reference"; _ref: string };
    alt?: string;
}
type Block = TextBlock | ImageBlock;

let __counter = 0;
function key(prefix: string) { return `${prefix}-${__counter++}`; }

const IMAGE_MARKER_RE = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const STRONG_RE = /\*\*([^*\n]+)\*\*/g;
const EM_RE = /(?:^|[^*])\*([^*\n]+)\*/g; // simple em (avoid clashing with **)
const CODE_RE = /`([^`\n]+)`/g;

// ── Inline parser ────────────────────────────────────────────────────────────
// Emits spans + markDefs for a single text run. Recognizes:
//   **strong**, *em*, `code`, [text](url)
function parseInline(text: string): { spans: Span[]; markDefs: MarkDef[] } {
    interface Marker { start: number; end: number; mark: string; href?: string; inner: string }
    const markers: Marker[] = [];

    // Links first (so they don't collide with em/code inside the text).
    LINK_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = LINK_RE.exec(text)) !== null) {
        markers.push({ start: m.index, end: m.index + m[0].length, mark: "link", href: m[2], inner: m[1] });
    }

    const ranges = (re: RegExp, mark: string) => {
        re.lastIndex = 0;
        const out: Array<{ start: number; end: number; inner: string }> = [];
        let mm: RegExpExecArray | null;
        while ((mm = re.exec(text)) !== null) {
            out.push({ start: mm.index, end: mm.index + mm[0].length, inner: mm[1] });
        }
        return out.map((r) => ({ ...r, mark }));
    };

    for (const r of ranges(STRONG_RE, "strong")) markers.push({ ...r });
    // *em* — skip ranges already covered by strong/link
    EM_RE.lastIndex = 0;
    let em: RegExpExecArray | null;
    while ((em = EM_RE.exec(text)) !== null) {
        const start = em.index + em[0].indexOf("*");
        const end = em.index + em[0].length;
        const overlaps = markers.some(
            (mm) => start < mm.end && end > mm.start,
        );
        if (!overlaps) markers.push({ start, end, mark: "em", inner: em[1] });
    }
    for (const r of ranges(CODE_RE, "code")) {
        const overlaps = markers.some((mm) => r.start < mm.end && r.end > mm.start);
        if (!overlaps) markers.push({ ...r });
    }

    markers.sort((a, b) => a.start - b.start);

    const spans: Span[] = [];
    const markDefs: MarkDef[] = [];
    let cursor = 0;
    for (const mk of markers) {
        if (mk.start > cursor) {
            const plain = text.slice(cursor, mk.start);
            if (plain) spans.push({ _type: "span", _key: key("s"), text: plain, marks: [] });
        }
        if (mk.mark === "link") {
            const def: MarkDef = { _key: key("link"), _type: "link", href: mk.href! };
            markDefs.push(def);
            spans.push({ _type: "span", _key: key("s"), text: mk.inner, marks: [def._key] });
        } else {
            spans.push({ _type: "span", _key: key("s"), text: mk.inner, marks: [mk.mark] });
        }
        cursor = mk.end;
    }
    if (cursor < text.length) {
        const tail = text.slice(cursor);
        if (tail) spans.push({ _type: "span", _key: key("s"), text: tail, marks: [] });
    }
    if (spans.length === 0) spans.push({ _type: "span", _key: key("s"), text: "", marks: [] });
    return { spans, markDefs };
}

function makeTextBlock(text: string, style: TextBlock["style"], opts: { listItem?: "bullet"; level?: number } = {}): TextBlock {
    const { spans, markDefs } = parseInline(text);
    return {
        _type: "block",
        _key: key("block"),
        style,
        markDefs,
        children: spans,
        ...(opts.listItem ? { listItem: opts.listItem } : {}),
        ...(opts.level ? { level: opts.level } : {}),
    };
}

// ── Public: markdown → portable text ─────────────────────────────────────────
// Each paragraph is independent. Inline image markers split the paragraph and
// produce top-level image blocks. Heading/quote/list markers act at line start
// of a paragraph (no multi-paragraph headings).
export function markdownToPortable(body: string): Block[] {
    __counter = 0;
    const out: Block[] = [];
    const paragraphs = body.split(/\n{2,}/).map((p) => p.replace(/\s+$/g, "")).filter((p) => p.trim().length > 0);

    for (const para of paragraphs) {
        // Bullet list? A paragraph where every line starts with "- " or "* "
        const lines = para.split("\n");
        const isBulletList = lines.length > 0 && lines.every((l) => /^[-*]\s+/.test(l.trim()));
        if (isBulletList) {
            for (const line of lines) {
                const text = line.trim().replace(/^[-*]\s+/, "");
                out.push(makeTextBlock(text, "normal", { listItem: "bullet", level: 1 }));
            }
            continue;
        }

        // Single-line styles (heading / blockquote): only if the paragraph is one logical line
        if (lines.length === 1) {
            const line = lines[0].trim();
            const h2 = line.match(/^#\s+(.+)/);
            if (h2) { out.push(makeTextBlock(h2[1], "h2")); continue; }
            const h3 = line.match(/^##\s+(.+)/);
            if (h3) { out.push(makeTextBlock(h3[1], "h3")); continue; }
            const h4 = line.match(/^###\s+(.+)/);
            if (h4) { out.push(makeTextBlock(h4[1], "h4")); continue; }
            const quote = line.match(/^>\s+(.+)/);
            if (quote) { out.push(makeTextBlock(quote[1], "blockquote")); continue; }
        } else {
            // Multi-line blockquote (every line is "> ...") → one blockquote block
            const allQuote = lines.length > 0 && lines.every((l) => /^>\s/.test(l.trim()));
            if (allQuote) {
                const text = lines.map((l) => l.trim().replace(/^>\s+/, "")).join(" ");
                out.push(makeTextBlock(text, "blockquote"));
                continue;
            }
        }

        // Default: split paragraph by inline image markers; each marker becomes an image block.
        let last = 0;
        IMAGE_MARKER_RE.lastIndex = 0;
        const merged = lines.join("\n");
        let match: RegExpExecArray | null;
        while ((match = IMAGE_MARKER_RE.exec(merged)) !== null) {
            const before = merged.slice(last, match.index).trim();
            if (before) out.push(makeTextBlock(before, "normal"));
            const ref = sanityImageRefFromUrl(match[2]);
            if (ref) {
                out.push({
                    _type: "image",
                    _key: key("img"),
                    asset: { _type: "reference", _ref: ref },
                    alt: match[1] || "",
                });
            } else {
                out.push(makeTextBlock(match[0], "normal"));
            }
            last = match.index + match[0].length;
        }
        const tail = merged.slice(last).trim();
        if (tail) out.push(makeTextBlock(tail, "normal"));
    }

    return out;
}

// ── Public: portable text → markdown ─────────────────────────────────────────
export function portableToMarkdown(
    blocks: unknown,
    refToUrl: (assetRef: string) => string | null,
): string {
    if (!Array.isArray(blocks)) return "";
    const parts: string[] = [];
    let inBulletGroup = false;
    const bulletBuffer: string[] = [];

    const flushBullets = () => {
        if (bulletBuffer.length > 0) {
            parts.push(bulletBuffer.join("\n"));
            bulletBuffer.length = 0;
        }
        inBulletGroup = false;
    };

    for (const b of blocks as Array<Record<string, any>>) {
        if (!b || typeof b !== "object") continue;
        if (b._type === "image") {
            flushBullets();
            const url = b.asset?._ref ? refToUrl(b.asset._ref) : null;
            const alt = b.alt ?? "";
            if (url) parts.push(`![${alt}](${url})`);
            continue;
        }
        if (b._type !== "block") continue;

        const spans = Array.isArray(b.children) ? b.children : [];
        const markDefs = Array.isArray(b.markDefs) ? b.markDefs : [];
        const rendered = spans.map((s: any) => {
            let text = s?.text ?? "";
            const marks: string[] = Array.isArray(s?.marks) ? s.marks : [];
            for (const mk of marks) {
                const def = markDefs.find((d: any) => d?._key === mk);
                if (def?._type === "link") {
                    text = `[${text}](${def.href})`;
                } else if (mk === "strong") text = `**${text}**`;
                else if (mk === "em") text = `*${text}*`;
                else if (mk === "code") text = `\`${text}\``;
            }
            return text;
        }).join("");

        if (b.listItem === "bullet") {
            if (!inBulletGroup) inBulletGroup = true;
            bulletBuffer.push(`- ${rendered}`);
            continue;
        }
        flushBullets();

        const style = b.style ?? "normal";
        if (style === "h2") parts.push(`# ${rendered}`);
        else if (style === "h3") parts.push(`## ${rendered}`);
        else if (style === "h4") parts.push(`### ${rendered}`);
        else if (style === "blockquote") parts.push(`> ${rendered}`);
        else parts.push(rendered);
    }
    flushBullets();
    return parts.filter(Boolean).join("\n\n");
}
