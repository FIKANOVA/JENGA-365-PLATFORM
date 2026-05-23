import "server-only";
import { createClient } from "@sanity/client";

// Write-capable client. Uses the backend SANITY_API_TOKEN — never expose to the browser.
export const sanityWriteClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2024-03-04",
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
});
