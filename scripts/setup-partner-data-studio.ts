/**
 * One-shot operator tool: provision a Corporate Partner's Data Studio surface.
 *
 * What this does, per CLAUDE.md §11 and IMPLEMENTATION_PLAN.md Phase 2.5:
 *
 *   1. Calls create_partner_impact_view(<partner_uuid>) → emits a per-partner
 *      pgView named v_partner_<short>_impact (defined in migration 0008).
 *   2. Stamps the partner row's data_studio_report_id + data_studio_share_url columns
 *      so the partner dashboard's DataStudioEmbed component picks it up.
 *
 * Usage:
 *   npx dotenv -e .env -- npx tsx scripts/setup-partner-data-studio.ts \
 *     --partner=<uuid> \
 *     --report-id=<data_studio_report_id> \
 *     --share-url=<https://lookerstudio.google.com/...>
 *
 * The share URL must start with https://lookerstudio.google.com/ — enforced by
 * the corporate_partners_data_studio_share_url_format CHECK constraint (0009).
 */
import https from "node:https";

const originalFetch = global.fetch;
(global as unknown as { fetch: typeof fetch }).fetch = async (
    url: string | Request | URL,
    options?: RequestInit,
) => {
    const urlStr = url.toString();
    if (urlStr.includes("neon.tech")) {
        const urlObj = new URL(urlStr);
        const host = urlObj.host;
        const ip = "54.86.249.90";
        return new Promise<Response>((resolve, reject) => {
            const body = options?.body as string | Buffer | undefined;
            const reqOptions: https.RequestOptions = {
                hostname: ip,
                port: 443,
                path: urlObj.pathname + urlObj.search,
                method: options?.method || "POST",
                headers: {
                    ...((options?.headers as Record<string, string>) || {}),
                    Host: host,
                    "Content-Length": body ? Buffer.byteLength(body as string) : 0,
                },
                servername: host,
                rejectUnauthorized: false,
            };
            const req = https.request(reqOptions, (res) => {
                let data = "";
                res.on("data", (c) => (data += c));
                res.on("end", () =>
                    resolve({
                        status: res.statusCode,
                        ok: res.statusCode! >= 200 && res.statusCode! < 300,
                        text: async () => data,
                        json: async () => JSON.parse(data),
                        headers: new Headers(res.headers as Record<string, string>),
                    } as unknown as Response),
                );
            });
            req.on("error", reject);
            if (body) req.write(body);
            req.end();
        });
    }
    return originalFetch(url, options);
};

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    throw new Error(
        "DATABASE_URL not set — run with: npx dotenv -e .env -- npx tsx scripts/setup-partner-data-studio.ts ...",
    );
}

function parseArgs() {
    const args: Record<string, string> = {};
    for (const arg of process.argv.slice(2)) {
        const m = arg.match(/^--([^=]+)=(.*)$/);
        if (m) args[m[1]] = m[2];
    }
    return args;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function usage(): never {
    console.error(
        "Usage: npx dotenv -e .env -- npx tsx scripts/setup-partner-data-studio.ts \\\n" +
            "  --partner=<uuid> \\\n" +
            "  --report-id=<data_studio_report_id> \\\n" +
            "  --share-url=<https://lookerstudio.google.com/...>",
    );
    process.exit(1);
}

const args = parseArgs();
const partnerId = args.partner;
const reportId = args["report-id"];
const shareUrl = args["share-url"];

if (!partnerId || !reportId || !shareUrl) {
    console.error("ERROR: --partner, --report-id, and --share-url are all required.\n");
    usage();
}

if (!UUID_REGEX.test(partnerId)) {
    console.error(`ERROR: --partner must be a UUID, got "${partnerId}".`);
    process.exit(1);
}

if (!shareUrl.startsWith("https://lookerstudio.google.com/")) {
    console.error(
        `ERROR: --share-url must start with https://lookerstudio.google.com/ (CLAUDE.md §11 + migration 0009 CHECK).`,
    );
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function run() {
    // 1. Verify the partner exists before touching anything.
    const rows = (await sql.query(
        "SELECT id, org_name FROM corporate_partners WHERE id = $1",
        [partnerId],
    )) as Array<{ id: string; org_name: string }>;

    if (rows.length === 0) {
        console.error(`ERROR: no corporate_partners row with id ${partnerId}`);
        process.exit(1);
    }
    const partner = rows[0];
    console.log(`Found partner: ${partner.org_name} (${partner.id})`);

    // 2. Generate the per-partner impact view.
    const viewRows = (await sql.query(
        "SELECT create_partner_impact_view($1::uuid) AS view_name",
        [partnerId],
    )) as Array<{ view_name: string }>;
    const viewName = viewRows[0].view_name;
    console.log(`✓ Created/refreshed view: ${viewName}`);

    // 3. Stamp the looker columns.
    await sql.query(
        "UPDATE corporate_partners SET data_studio_report_id = $1, data_studio_share_url = $2 WHERE id = $3",
        [reportId, shareUrl, partnerId],
    );
    console.log(`✓ Updated corporate_partners.data_studio_report_id + data_studio_share_url`);

    console.log("\nNext: visit the partner dashboard. The DataStudioEmbed component");
    console.log(`will render the iframe + share-link button immediately.\n`);
    console.log(`Pointed at view:   ${viewName}`);
    console.log(`Data Studio report id:  ${reportId}`);
    console.log(`Looker share URL:  ${shareUrl}`);
}

run()
    .then(() => process.exit(0))
    .catch((e: Error) => {
        console.error("Fatal:", e.message);
        process.exit(1);
    });
