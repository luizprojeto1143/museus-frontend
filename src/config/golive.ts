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

export function persistMuseumFromEquipment(equip: {
  tenantId: string;
  slug?: string;
  id: string;
  cidade?: string;
}): void {
  if (!equip.tenantId) return;
  writeMuseumCtx({
    tenantId: equip.tenantId,
    equipmentSlug: equip.slug || equip.id,
    citySlug: slugifyCity(equip.cidade),
  });
}

export function hasSelectedMuseum(authTenantId?: string | null): boolean {
  if (authTenantId && authTenantId !== "undefined" && authTenantId !== "null") return true;
  return Boolean(readMuseumCtx()?.tenantId);
}

export function isGoLiveAdminPath(pathname: string): boolean {
  if (
    pathname.startsWith("/theater") ||
    pathname.startsWith("/municipal") ||
    pathname.startsWith("/totem") ||
    pathname.startsWith("/producer") ||
    pathname.startsWith("/provider") ||
    pathname.startsWith("/sponsor")
  ) {
    return false;
  }
  return Array.from(GOLIVE_ADMIN_KEEP).some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
