import fs from "node:fs";
import path from "node:path";
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    AlignmentType,
    ShadingType
} from "docx";

const cellPadding = { top: 120, bottom: 120, left: 160, right: 160 };

function createHeaderCell(text: string, widthPercent: number): TableCell {
    return new TableCell({
        width: { size: widthPercent, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: "F2F4F8" },
        margins: cellPadding,
        children: [
            new Paragraph({
                children: [new TextRun({ text, bold: true, size: 22, font: "Arial", color: "111827" })],
            }),
        ],
    });
}

function createCell(text: string, widthPercent: number, isBold: boolean = false): TableCell {
    return new TableCell({
        width: { size: widthPercent, type: WidthType.PERCENTAGE },
        margins: cellPadding,
        children: [
            new Paragraph({
                children: [new TextRun({ text, bold: isBold, size: 20, font: "Arial", color: "374151" })],
            }),
        ],
    });
}

function createCheckboxCell(widthPercent: number): TableCell {
    return new TableCell({
        width: { size: widthPercent, type: WidthType.PERCENTAGE },
        margins: cellPadding,
        children: [
            new Paragraph({
                children: [
                    new TextRun({ text: "☐ Pass\n☐ Fail", size: 20, font: "Arial", color: "1F2937" }),
                ],
            }),
        ],
    });
}

const doc = new Document({
    sections: [
        {
            properties: {},
            children: [
                new Paragraph({
                    heading: HeadingLevel.TITLE,
                    children: [
                        new TextRun({
                            text: "Jenga365 AI Platform — Guest User & UX Testing Checklist",
                            bold: true,
                            size: 36,
                            font: "Arial",
                            color: "0F172A",
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "A non-technical, step-by-step checklist to test guest browsing, public features, route security boundaries, and user registration.",
                            italics: true,
                            size: 22,
                            font: "Arial",
                            color: "4B5563",
                        }),
                    ],
                    spacing: { after: 300 },
                }),

                // Quick Start Box
                new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    children: [new TextRun({ text: "Quick Start (Takes 2 Minutes)", bold: true, size: 28, font: "Arial", color: "1E3A8A" })],
                    spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "1. Open an Incognito / Private Window in your browser (Ctrl+Shift+N / Cmd+Shift+N).\n", size: 22, font: "Arial" }),
                        new TextRun({ text: "2. Have your screenshot tool ready (Win+Shift+S / Cmd+Shift+4).\n", size: 22, font: "Arial" }),
                        new TextRun({ text: "3. Test on both your Computer and Phone if possible.", size: 22, font: "Arial" }),
                    ],
                    spacing: { after: 300 },
                }),

                // Part 1
                new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    children: [new TextRun({ text: "Part 1: Browsing the Website (Public Content Discovery)", bold: true, size: 28, font: "Arial", color: "1E3A8A" })],
                    spacing: { before: 300, after: 100 },
                }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                createHeaderCell("Page / Area", 25),
                                createHeaderCell("What to Do", 35),
                                createHeaderCell("Expected Result", 25),
                                createHeaderCell("Status", 15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("Home Page (/)", 25, true),
                                createCell("Scroll from top to bottom.", 35),
                                createCell("Hero loads, partner logos visible, Sign Up & Log In buttons present. Zero broken images.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("Header Nav", 25, true),
                                createCell("Inspect top navigation bar.", 35),
                                createCell("Shows Sign Up, Log In, Donate, Store. No avatar or notification bell.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("Mobile Menu", 25, true),
                                createCell("On phone, tap 3-line hamburger menu.", 35),
                                createCell("Menu slides open smoothly; all navigation links work and close properly.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("About Us (/about)", 25, true),
                                createCell("Read mission, team, and pillars.", 35),
                                createCell("All leadership photos and text cards load without stretching.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("Articles (/articles)", 25, true),
                                createCell("1. Filter by category.\n2. Open an article.", 35),
                                createCell("Filters update list instantly. Article opens with readable formatting.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("Events (/events)", 25, true),
                                createCell("View upcoming events & click one.", 35),
                                createCell("Dates, times, and location/virtual status display clearly.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("Mentors (/mentors)", 25, true),
                                createCell("Browse mentor directory cards.", 35),
                                createCell("Bios and skills show. Personal phone/emails remain protected.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("Help / FAQs (/help)", 25, true),
                                createCell("Click questions to expand/collapse.", 35),
                                createCell("Questions expand smoothly. Answers are clear and readable.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("404 Page Test", 25, true),
                                createCell("Type /this-does-not-exist in URL.", 35),
                                createCell("Shows friendly 404 page with 'Back to Home' button.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                    ],
                }),

                // Part 2
                new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    children: [new TextRun({ text: "Part 2: Trying Interactive Features (No Login Required)", bold: true, size: 28, font: "Arial", color: "1E3A8A" })],
                    spacing: { before: 400, after: 100 },
                }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                createHeaderCell("Feature", 25),
                                createHeaderCell("What to Test", 35),
                                createHeaderCell("Expected Result", 25),
                                createHeaderCell("Status", 15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("Contact Form (/contact)", 25, true),
                                createCell("Fill name, email, subject, message & send.", 35),
                                createCell("Shows green success message; form fields clear.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("Contact Validation", 25, true),
                                createCell("Submit empty form or broken email.", 35),
                                createCell("Red warning text explains what needs fixing.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("Store & Cart (/shop)", 25, true),
                                createCell("1. Add item to cart.\n2. Open cart.", 35),
                                createCell("Header cart badge updates to 1. Cart shows item & price.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("Cart Adjustments", 25, true),
                                createCell("Change quantity (+/-) or remove item.", 35),
                                createCell("Subtotal calculates correctly; item removes cleanly.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("Donation Flow (/donate)", 25, true),
                                createCell("Select amount ($10, $25, $50) & click Donate.", 35),
                                createCell("Amount updates. Donate button opens secure Paystack payment window.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                    ],
                }),

                // Part 3
                new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    children: [new TextRun({ text: "Part 3: The 'Locked Door' Test (Direct URL Access)", bold: true, size: 28, font: "Arial", color: "1E3A8A" })],
                    spacing: { before: 400, after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Type these addresses directly into your browser address bar as a guest. The site must safely block access and ask you to log in.",
                            italics: true,
                            size: 20,
                            font: "Arial",
                            color: "DC2626",
                        }),
                    ],
                    spacing: { after: 150 },
                }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                createHeaderCell("Direct Link to Test", 30),
                                createHeaderCell("Expected Behavior", 35),
                                createHeaderCell("Did it block & ask to Log In?", 20),
                                createHeaderCell("Status", 15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("/dashboard", 30, true),
                                createCell("Redirects to /login?next=/dashboard", 35),
                                createCell("☐ Yes   ☐ No", 20),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("/dashboard/admin", 30, true),
                                createCell("Redirects to /login?next=/dashboard/admin", 35),
                                createCell("☐ Yes   ☐ No", 20),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("/dashboard/mentor", 30, true),
                                createCell("Redirects to /login?next=/dashboard/mentor", 35),
                                createCell("☐ Yes   ☐ No", 20),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("/dashboard/mentee", 30, true),
                                createCell("Redirects to /login?next=/dashboard/mentee", 35),
                                createCell("☐ Yes   ☐ No", 20),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("/dashboard/settings", 30, true),
                                createCell("Redirects to /login?next=/dashboard/settings", 35),
                                createCell("☐ Yes   ☐ No", 20),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("/onboarding/intake", 30, true),
                                createCell("Redirects to /login?next=/onboarding/intake", 35),
                                createCell("☐ Yes   ☐ No", 20),
                                createCheckboxCell(15),
                            ],
                        }),
                    ],
                }),

                // Part 4
                new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    children: [new TextRun({ text: "Part 4: Signing Up as a New User (Registration Testing)", bold: true, size: 28, font: "Arial", color: "1E3A8A" })],
                    spacing: { before: 400, after: 100 },
                }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                createHeaderCell("Step", 25),
                                createHeaderCell("Action", 35),
                                createHeaderCell("Expected Result", 25),
                                createHeaderCell("Status", 15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("Role Choice (/register)", 25, true),
                                createCell("Click Sign Up from top header.", 35),
                                createCell("Displays clear cards for Mentee, Mentor, Corporate Partner, NGO.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("Validation Errors", 25, true),
                                createCell("Submit empty form or weak password.", 35),
                                createCell("Friendly warnings explain what is required.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("Mentee Registration", 25, true),
                                createCell("Fill name, test email, and password.", 35),
                                createCell("Account created; prompts to verify email.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("Mentor Registration", 25, true),
                                createCell("Fill mentor bio & upload CV (PDF).", 35),
                                createCell("File uploads; clarifies that mentor accounts require approval.", 25),
                                createCheckboxCell(15),
                            ],
                        }),
                    ],
                }),

                // Part 5 - Findings
                new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    children: [new TextRun({ text: "📝 Tester Findings & Notes Sheet", bold: true, size: 28, font: "Arial", color: "1E3A8A" })],
                    spacing: { before: 400, after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Tester Name: ___________________________       Date: ______________\n", size: 22, font: "Arial" }),
                        new TextRun({ text: "Device Used: ___________________________       Browser: ______________\n", size: 22, font: "Arial" }),
                    ],
                    spacing: { after: 200 },
                }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                createHeaderCell("#", 5),
                                createHeaderCell("Page / URL", 20),
                                createHeaderCell("What Were You Trying to Do?", 35),
                                createHeaderCell("What Went Wrong?", 30),
                                createHeaderCell("Photo?", 10),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("1", 5),
                                createCell("", 20),
                                createCell("", 35),
                                createCell("", 30),
                                createCell("", 10),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("2", 5),
                                createCell("", 20),
                                createCell("", 35),
                                createCell("", 30),
                                createCell("", 10),
                            ],
                        }),
                        new TableRow({
                            children: [
                                createCell("3", 5),
                                createCell("", 20),
                                createCell("", 35),
                                createCell("", 30),
                                createCell("", 10),
                            ],
                        }),
                    ],
                }),
            ],
        },
    ],
});

Packer.toBuffer(doc).then((buffer) => {
    const outDir = path.join(process.cwd(), "docs", "qa");
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }
    const filePath = path.join(outDir, "JENGA365_GUEST_TESTING_CHECKLIST.docx");
    fs.writeFileSync(filePath, buffer);
    console.log("Successfully generated:", filePath);
});
