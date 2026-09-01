export const GOLIVE_ADMIN_KEEP = new Set([
  "/admin",
  "/admin/obras",
  "/admin/trilhas",
  "/admin/categorias",
  "/admin/uploads",
  "/admin/eventos",
  "/admin/verificar-ingressos",
  "/admin/scanner",
  "/admin/espacos",
  "/admin/calendario",
  "/admin/visitantes",
  "/admin/usuarios",
  "/admin/configuracoes",
]);

export const MUSEUM_CTX_KEY = "museus_museum_ctx";

export type MuseumCtx = {
  citySlug: string;
  equipmentSlug: string;
  tenantId: string;
};

export function slugifyCity(name: string | null | undefined): string {
  const raw = (name || "museu").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "museu";
}

export function readMuseumCtx(): MuseumCtx | null {
  try {
    const raw = localStorage.getItem(MUSEUM_CTX_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MuseumCtx;
    if (parsed?.tenantId && parsed?.equipmentSlug && parsed?.citySlug) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeMuseumCtx(ctx: MuseumCtx): void {
  localStorage.setItem(MUSEUM_CTX_KEY, JSON.stringify(ctx));
}
