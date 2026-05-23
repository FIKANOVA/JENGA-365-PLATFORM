// Sanity image asset URL → asset _ref. Pattern: the URL ends in
// "<assetIdAndDims>.<ext>" and the asset _id is "image-<assetIdAndDims>-<ext>".
// Example URL: https://cdn.sanity.io/images/<proj>/<ds>/abc-1920x1080.jpg
//        ref:  image-abc-1920x1080-jpg
export function sanityImageRefFromUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    const match = url.match(/\/([^/]+)\.(\w+)(?:\?.*)?$/);
    if (!match) return null;
    return `image-${match[1]}-${match[2]}`;
}
