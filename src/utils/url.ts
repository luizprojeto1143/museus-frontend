export const getFullUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    // Use the VITE_API_URL or default to production backend
    let baseURL = (import.meta.env.VITE_API_URL as string | undefined) || "https://museus-backend.onrender.com";

    // Remove trailing slash
    baseURL = baseURL.replace(/\/$/, "");

    // If path doesn't start with /, add it
    const safePath = path.startsWith('/') ? path : `/${path}`;

    return `${baseURL}${safePath}`;
};
