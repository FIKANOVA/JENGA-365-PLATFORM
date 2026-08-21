import { describe, it, expect } from "vitest";
import { markdownToPortable } from "../../lib/sanity/markdownPortable";

describe("markdownToPortable", () => {
    it("should parse a basic paragraph", () => {
        const markdown = "This is a basic paragraph.";
        const result = markdownToPortable(markdown);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            _type: "block",
            style: "normal",
            children: [{ _type: "span", text: "This is a basic paragraph.", marks: [] }],
        });
    });

    it("should parse multiple paragraphs", () => {
        const markdown = "Paragraph 1.\n\nParagraph 2.";
        const result = markdownToPortable(markdown);

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ style: "normal", children: [{ text: "Paragraph 1." }] });
        expect(result[1]).toMatchObject({ style: "normal", children: [{ text: "Paragraph 2." }] });
    });

    it("should parse inline formatting: strong, em, code", () => {
        const markdown = "This is **strong**, *em*, and `code`.";
        const result = markdownToPortable(markdown);

        expect(result).toHaveLength(1);
        const children = (result[0] as any).children;
        expect(children).toHaveLength(7);
        expect(children[0].text).toBe("This is ");
        expect(children[1].text).toBe("strong");
        expect(children[1].marks).toContain("strong");
        expect(children[2].text).toBe(", ");
        expect(children[3].text).toBe("em");
        expect(children[3].marks).toContain("em");
        expect(children[4].text).toBe(", and ");
        expect(children[5].text).toBe("code");
        expect(children[5].marks).toContain("code");
        expect(children[6].text).toBe(".");
    });

    it("should parse inline links", () => {
        const markdown = "Here is a [link](https://example.com).";
        const result = markdownToPortable(markdown);

        expect(result).toHaveLength(1);
        const block = result[0] as any;
        expect(block.markDefs).toHaveLength(1);
        expect(block.markDefs[0]).toMatchObject({ _type: "link", href: "https://example.com" });

        const children = block.children;
        expect(children).toHaveLength(3);
        expect(children[0].text).toBe("Here is a ");
        expect(children[1].text).toBe("link");
        expect(children[1].marks).toContain(block.markDefs[0]._key);
        expect(children[2].text).toBe(".");
    });

    it("should parse headings", () => {
        const markdown = "# Heading 2\n\n## Heading 3\n\n### Heading 4";
        const result = markdownToPortable(markdown);

        expect(result).toHaveLength(3);
        expect(result[0]).toMatchObject({ style: "h2", children: [{ text: "Heading 2" }] });
        expect(result[1]).toMatchObject({ style: "h3", children: [{ text: "Heading 3" }] });
        expect(result[2]).toMatchObject({ style: "h4", children: [{ text: "Heading 4" }] });
    });

    it("should parse blockquotes", () => {
        const singleLine = "> This is a quote";
        const multiLine = "> Line 1\n> Line 2";

        expect(markdownToPortable(singleLine)[0]).toMatchObject({
            style: "blockquote",
            children: [{ text: "This is a quote" }]
        });

        expect(markdownToPortable(multiLine)[0]).toMatchObject({
            style: "blockquote",
            children: [{ text: "Line 1 Line 2" }]
        });
    });

    it("should parse bullet lists", () => {
        const markdown = "- Item 1\n* Item 2";
        const result = markdownToPortable(markdown);

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({
            style: "normal",
            listItem: "bullet",
            level: 1,
            children: [{ text: "Item 1" }]
        });
        expect(result[1]).toMatchObject({
            style: "normal",
            listItem: "bullet",
            level: 1,
            children: [{ text: "Item 2" }]
        });
    });

    it("should parse images and extract sanity references", () => {
        const markdown = "![Alt text](https://cdn.sanity.io/images/project/dataset/abc-1920x1080.jpg)";
        const result = markdownToPortable(markdown);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            _type: "image",
            alt: "Alt text",
            asset: { _type: "reference", _ref: "image-abc-1920x1080-jpg" }
        });
    });

    it("should fallback for non-image or invalid URLs by parsing as normal text", () => {
        // Since sanityImageRefFromUrl is quite lenient and parses https://example.com/image.jpg as a valid ref (image-image-jpg),
        // we test the fallback with a URL that doesn't end in an extension.
        // And since IMAGE_MARKER_RE doesn't match this invalid image format (it doesn't have an image extension or is valid) it falls back to parsing as markdown inline elements which parses [text](url) as a link
        const markdown = "![Alt text](https://example.com/not-an-image)";
        const result = markdownToPortable(markdown);

        expect(result).toHaveLength(1);
        const children = (result[0] as any).children;
        // Should parse ! as text, and the rest as a link
        expect(children[0].text).toBe("!");
        expect(children[1].text).toBe("Alt text");
        expect(children[1].marks).toHaveLength(1); // the link mark
    });
});
