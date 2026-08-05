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

interface _WorksResponse {
    data: WorkResponse[];
    pagination?: unknown;
}

interface WorkResponse {
    id: string;
    title?: string | null;
    artist?: string | null;
    year?: string | null;
    category?: { name?: string | null } | string | null;
    imageUrl?: string | null;
    audioUrl?: string | null;
    librasUrl?: string | null;
}

export function useWorks(params?: { limit?: number; page?: number; search?: string }) {
    const { tenantId, equipamentoId } = useAuth();

    return useQuery({
        queryKey: ["works", tenantId, equipamentoId, params],
        queryFn: async (): Promise<Work[]> => {
            if (!tenantId) return [];

            const { data } = await api.get<WorkResponse[] | _WorksResponse>("/works", {
                params: { ...params, tenantId, equipamentoId }
            });

            const rawData = Array.isArray(data) ? data : (data.data || []);

            return rawData.map((w) => ({
                id: w.id,
                title: w.title || "Sem titulo",
                artist: w.artist ?? "Artista desconhecido",
                year: w.year ?? "",
                category: (w.category && typeof w.category === 'object' ? w.category.name : w.category) || "Obra",
                accessible: !!w.audioUrl || !!w.librasUrl,
                imageUrl: getFullUrl(w.imageUrl)
            }));
        },
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 5 // 5 minutes cache
    });
}
