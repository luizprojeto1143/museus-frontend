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

/** Dummy fallbacks that must never be persisted or used in visitor routes. */
const PLACEHOLDER_SLUGS = new Set(["museu", "undefined", "null", "cidade"]);

export type MuseumCtx = {
  citySlug: string;
  equipmentSlug: string;
  tenantId: string;
};

export type EquipmentCitySource = {
  tenantId?: string | null;
  slug?: string | null;
  id?: string | null;
  cidade?: unknown;
  city?: unknown;
  citySlug?: unknown;
  cityName?: unknown;
  municipio?: unknown;
};

export function isUsableSlug(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const slug = value.trim();
  if (!slug) return false;
  if (PLACEHOLDER_SLUGS.has(slug.toLowerCase())) return false;
  return true;
}

export function slugifyCity(name: string | null | undefined): string {
  const raw = (name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return isUsableSlug(slug) ? slug : "";
}

function slugFromUnknown(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (trimmed.includes("/") || trimmed.includes(" ")) return slugifyCity(trimmed);
    if (isUsableSlug(trimmed) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(trimmed)) return trimmed.toLowerCase();
    return slugifyCity(trimmed);
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (isUsableSlug(obj.slug)) return String(obj.slug).trim();
    if (isUsableSlug(obj.citySlug)) return String(obj.citySlug).trim();
    const named = obj.nome ?? obj.name ?? obj.cidade ?? obj.cityName;
    if (typeof named === "string") return slugifyCity(named);
  }
  return "";
}

/** Real city slug from museum/city object — never "museu" placeholder, never "undefined". */
export function resolveCitySlug(equip: EquipmentCitySource, nameFallback?: string | null): string {
  const candidates = [
    slugFromUnknown(equip.city),
    slugFromUnknown(equip.citySlug),
    slugFromUnknown(equip.cidade),
    slugFromUnknown(equip.cityName),
    slugFromUnknown(equip.municipio),
    slugifyCity(nameFallback),
  ];
  return candidates.find((s) => isUsableSlug(s)) || "";
}

export function resolveEquipmentSlug(equip: EquipmentCitySource): string {
  if (isUsableSlug(equip.slug)) return String(equip.slug).trim();
  if (isUsableSlug(equip.id)) return String(equip.id).trim();
  return "";
}

export function readMuseumCtx(): MuseumCtx | null {
  try {
    const raw = localStorage.getItem(MUSEUM_CTX_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MuseumCtx;
    if (parsed?.tenantId && isUsableSlug(parsed.equipmentSlug) && isUsableSlug(parsed.citySlug)) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function writeMuseumCtx(ctx: MuseumCtx): void {
  if (!ctx.tenantId || !isUsableSlug(ctx.citySlug) || !isUsableSlug(ctx.equipmentSlug)) return;
  localStorage.setItem(MUSEUM_CTX_KEY, JSON.stringify(ctx));
}

/** Keep real slugs already persisted; never invent citySlug "museu". */
export function mergeMuseumCtx(partial: {
  tenantId: string;
  equipmentSlug?: string | null;
  citySlug?: string | null;
}): void {
  if (!partial.tenantId || partial.tenantId === "undefined") return;
  const prev = readMuseumCtx();
  const sameTenant = prev?.tenantId === partial.tenantId;
  const citySlug = isUsableSlug(partial.citySlug)
    ? partial.citySlug.trim()
    : sameTenant && isUsableSlug(prev?.citySlug)
      ? prev!.citySlug
      : "";
  const equipmentSlug = isUsableSlug(partial.equipmentSlug)
    ? partial.equipmentSlug.trim()
    : sameTenant && isUsableSlug(prev?.equipmentSlug)
      ? prev!.equipmentSlug
      : "";
  if (!citySlug || !equipmentSlug) return;
  writeMuseumCtx({ tenantId: partial.tenantId, citySlug, equipmentSlug });
}

export function persistMuseumFromEquipment(
  equip: EquipmentCitySource,
  nameFallback?: string | null
): MuseumCtx | null {
  if (!equip.tenantId || equip.tenantId === "undefined") return null;
  const citySlug = resolveCitySlug(equip, nameFallback);
  const equipmentSlug = resolveEquipmentSlug(equip);
  if (!citySlug || !equipmentSlug) return null;
  const ctx: MuseumCtx = { tenantId: equip.tenantId, equipmentSlug, citySlug };
  writeMuseumCtx(ctx);
  return ctx;
}

export function museumEquipmentPath(
  equip: EquipmentCitySource,
  nameFallback?: string | null
): string | null {
  const citySlug = resolveCitySlug(equip, nameFallback);
  const equipmentSlug = resolveEquipmentSlug(equip);
  if (!citySlug || !equipmentSlug) return null;
  return `/cidades/${citySlug}/equipamentos/${equipmentSlug}`;
}

export function hasSelectedMuseum(_authTenantId?: string | null): boolean {
  const ctx = readMuseumCtx();
  return Boolean(ctx?.tenantId && isUsableSlug(ctx.citySlug) && isUsableSlug(ctx.equipmentSlug));
}

/** Recorte go-live desligado: todas as rotas admin/módulos voltam a ser visíveis. */
export function isGoLiveAdminPath(_pathname: string): boolean {
  return true;
}
