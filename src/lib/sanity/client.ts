import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";


const mockClient = {
    fetch: async () => [],
    withConfig: () => mockClient,
};

export const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "dummy",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2024-03-04",
    useCdn: false, // Set to false to ensure fresh data from Sanity immediately
    token: process.env.SANITY_API_TOKEN,
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: any) {
    return builder.image(source);
}
