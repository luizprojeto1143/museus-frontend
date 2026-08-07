const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

export const getApiBaseUrl = () => {
    let baseURL = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

    // In production or if missing/pointing to legacy URL, use the active backend URL
    if (!baseURL || baseURL === "https://museus-backend.onrender.com" || baseURL === "https://museus-backend.onrender.com/") {
        baseURL = "https://museus-backend-1.onrender.com";
    }

    return trimTrailingSlash(baseURL);
};

export const getFullUrl = (path: string | null | undefined) => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;

    const safePath = path.startsWith("/") ? path : `/${path}`;

    return `${getApiBaseUrl()}${safePath}`;
};
