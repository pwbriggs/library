export function getNextUrl(request: Request): string {
    try {
        const url = new URL(
            request.url,
            "https://example.com",
        ).searchParams.get("next");
        if (typeof url !== "string") {
            return "/";
        }
        return trimUrl(url);
    } catch (e) {
        return "/";
    }
}

/**
 * Trim just the pathname from a URL.
 * @param url The URL to trim.
 * @returns The pathname of the provided URL.
 */
export function trimUrl(url: string): string {
    try {
        return new URL(url, "https://example.com").pathname;
    } catch {
        return url;
    }
}
