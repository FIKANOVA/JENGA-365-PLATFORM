/**
 * Generate the three Jenga365 KoBoToolbox XLSForms.
 *
 * Each form's submission must match the discriminated union in
 * src/app/api/webhooks/kobo/route.ts (KoboTreeSchema | KoboPlantingSchema |
 * KoboGiveBackSchema). A fixed `form_type` calculate field drives the
 * discriminator; KoBo auto-injects _id, _submission_time, _geolocation
 * (from the first geopoint), and _attachments (from media fields).
 *
 * Run:  node scripts/kobo-forms/generate.js
 * Output: scripts/kobo-forms/{tree_survival,tree_planting,give_back}.xlsx
 */
const XLSX = require("xlsx");
const path = require("node:path");

const UUID_REGEX =
    "regex(., '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')";

const SURVEY_COLS = [
    "type",
    "name",
    "label",
    "required",
    "hint",
    "calculation",
    "constraint",
    "constraint_message",
    "default",
];

const CHOICES_COLS = ["list_name", "name", "label"];

const SETTINGS_COLS = ["form_title", "form_id", "version"];

function buildSheet(cols, rows) {
    const aoa = [cols, ...rows.map((r) => cols.map((c) => r[c] ?? ""))];
    return XLSX.utils.aoa_to_sheet(aoa);
}

function writeForm({ filename, title, formId, version, survey, choices }) {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, buildSheet(SURVEY_COLS, survey), "survey");
    XLSX.utils.book_append_sheet(
        wb,
        buildSheet(CHOICES_COLS, choices),
        "choices",
    );
    XLSX.utils.book_append_sheet(
        wb,
        buildSheet(SETTINGS_COLS, [
            { form_title: title, form_id: formId, version },
        ]),
        "settings",
    );
    const out = path.join(__dirname, filename);
    XLSX.writeFile(wb, out);
    console.log(`✓ ${filename}`);
}

const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

// ─── Form 1: tree_survival ──────────────────────────────────────────────────
writeForm({
    filename: "tree_survival.xlsx",
    title: "Jenga365 — Tree Survival Audit (Q-Audit)",
    formId: "jenga365_tree_survival",
    version: today,
    survey: [
        { type: "start", name: "start" },
        { type: "end", name: "end" },
        {
            type: "calculate",
            name: "form_type",
            calculation: "'tree_survival'",
        },
        {
            type: "date",
            name: "survey_date",
            label: "Date of survey",
            required: "yes",
            default: "today()",
        },
        {
            type: "integer",
            name: "check_interval_months",
            label: "Audit period (months since planting)",
            required: "yes",
            hint: "Enter 6, 12, or 24.",
            constraint: ". = 6 or . = 12 or . = 24",
            constraint_message: "Must be 6, 12, or 24.",
        },
        {
            type: "text",
            name: "project_location_id",
            label: "Project location ID",
            required: "yes",
            hint: "Paste the UUID from the Jenga365 dashboard for this planting site.",
            constraint: UUID_REGEX,
            constraint_message: "Must be a valid UUID (8-4-4-4-12 hex).",
        },
        {
            type: "integer",
            name: "trees_planted",
            label: "Trees originally planted at this location",
            required: "yes",
            constraint: ". >= 0",
        },
        {
            type: "integer",
            name: "trees_alive",
            label: "Trees still alive today",
            required: "yes",
            constraint: ". >= 0 and . <= ${trees_planted}",
            constraint_message: "Must be between 0 and trees originally planted.",
        },
        {
            type: "text",
            name: "surveyor_name",
            label: "Surveyor full name",
        },
        {
            type: "geopoint",
            name: "gps_location",
            label: "Capture GPS at the planting site",
            required: "yes",
            hint: "Stand at the site. KoBo will publish coordinates to top-level _geolocation.",
        },
        {
            type: "image",
            name: "tree_photo",
            label: "Photo evidence of surviving trees",
        },
        {
            type: "text",
            name: "audit_notes",
            label: "Notes (optional)",
        },
    ],
    choices: [],
});

// ─── Form 2: tree_planting ──────────────────────────────────────────────────
writeForm({
    filename: "tree_planting.xlsx",
    title: "Jenga365 — Tree Planting Event",
    formId: "jenga365_tree_planting",
    version: today,
    survey: [
        { type: "start", name: "start" },
        { type: "end", name: "end" },
        {
            type: "calculate",
            name: "form_type",
            calculation: "'tree_planting'",
        },
        {
            type: "text",
            name: "project_location_id",
            label: "Project location ID",
            required: "yes",
            hint: "UUID from Jenga365 dashboard.",
            constraint: UUID_REGEX,
            constraint_message: "Must be a valid UUID.",
        },
        {
            type: "date",
            name: "planted_at",
            label: "Planting date",
            required: "yes",
            default: "today()",
        },
        {
            type: "integer",
            name: "trees_planted",
            label: "Number of trees planted",
            required: "yes",
            constraint: ". > 0",
            constraint_message: "Must plant at least 1 tree.",
        },
        {
            type: "text",
            name: "species",
            label: "Species (optional)",
            hint: "e.g. Grevillea robusta, Mukinduri.",
        },
        {
            type: "text",
            name: "planted_by",
            label: "Planted by — Jenga365 user UUID (optional)",
            constraint:
                "string-length(.) = 0 or " +
                "regex(., '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')",
            constraint_message: "Leave blank or paste a valid UUID.",
        },
        {
            type: "geopoint",
            name: "gps_location",
            label: "GPS at the planting site",
            required: "yes",
        },
        {
            type: "image",
            name: "planting_photo",
            label: "Photo of planting event (optional)",
        },
    ],
    choices: [],
});

// ─── Form 3: give_back ──────────────────────────────────────────────────────
writeForm({
    filename: "give_back.xlsx",
    title: "Jenga365 — Quarterly Give-Back Tracking",
    formId: "jenga365_give_back",
    version: today,
    survey: [
        { type: "start", name: "start" },
        { type: "end", name: "end" },
        {
            type: "calculate",
            name: "form_type",
            calculation: "'give_back'",
        },
        {
            type: "text",
            name: "user_id",
            label: "Jenga365 user UUID",
            required: "yes",
            hint: "User performing the give-back (mentor or mentee).",
            constraint: UUID_REGEX,
            constraint_message: "Must be a valid UUID.",
        },
        {
            type: "text",
            name: "quarter",
            label: "Quarter (e.g. 2026-Q2)",
            required: "yes",
            constraint: "regex(., '^[0-9]{4}-Q[1-4]$')",
            constraint_message: "Format YYYY-QN, e.g. 2026-Q2.",
        },
        {
            type: "select_one activity_type",
            name: "activity_type",
            label: "Activity type",
        },
        {
            type: "text",
            name: "activity_description",
            label: "Describe what you did",
        },
        {
            type: "geopoint",
            name: "gps_location",
            label: "GPS at the activity location (optional)",
        },
        {
            type: "image",
            name: "activity_photo",
            label: "Photo evidence (optional)",
        },
    ],
    choices: [
        { list_name: "activity_type", name: "tree_planting", label: "Tree planting" },
        { list_name: "activity_type", name: "mentorship", label: "Mentorship session" },
        { list_name: "activity_type", name: "community_event", label: "Community event" },
        { list_name: "activity_type", name: "training", label: "Training / workshop" },
        { list_name: "activity_type", name: "cleanup", label: "Environmental clean-up" },
        { list_name: "activity_type", name: "other", label: "Other" },
    ],
});

console.log("\nDone. Upload each .xlsx in KoBo (New → Upload an XLSForm).");
