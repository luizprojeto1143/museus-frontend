import { useQuery } from "@tanstack/react-query";
import { api } from "../../../api/client";
import { getFullUrl } from "../../../utils/url";
import { useAuth } from "../../auth/AuthContext";

export interface Work {
    id: string;
    title: string;
    artist: string;
    year?: string;
    category?: string;
    imageUrl?: string | null;
    accessible?: boolean;
}

interface WorksResponse {
    data: any[];
    pagination?: any;
}

export function useWorks(params?: { limit?: number; page?: number; search?: string }) {
    const { tenantId } = useAuth();

    return useQuery({
        queryKey: ["works", tenantId, params],
        queryFn: async (): Promise<Work[]> => {
            if (!tenantId) return [];

            const { data } = await api.get("/works", {
                params: { ...params, tenantId }
            });

            const rawData = Array.isArray(data) ? data : (data.data || []);

            return rawData.map((w: any) => ({
                id: w.id,
                title: w.title,
                artist: w.artist ?? "Artista desconhecido",
                year: w.year ?? "",
                category: typeof w.category === 'object' ? w.category?.name : w.category ?? "Obra",
                accessible: !!w.audioUrl || !!w.librasUrl,
                imageUrl: getFullUrl(w.imageUrl)
            }));
        },
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 5 // 5 minutes cache
    });
}
