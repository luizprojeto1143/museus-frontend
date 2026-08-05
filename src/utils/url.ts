const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

export const getApiBaseUrl = () => {
    const baseURL = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

    if (!baseURL) {
        throw new Error("VITE_API_URL precisa estar configurado para conectar o frontend ao backend.");
    }

    return trimTrailingSlash(baseURL);
};

export const getFullUrl = (path: string | null | undefined) => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;

    const safePath = path.startsWith("/") ? path : `/${path}`;

    return `${getApiBaseUrl()}${safePath}`;
};
