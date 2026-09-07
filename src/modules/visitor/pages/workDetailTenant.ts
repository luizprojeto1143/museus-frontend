import { readMuseumCtx } from "@/config/golive";

/** Resolve tenant for catalog GETs from auth tenantId or selected museum ctx. */
export function workDetailCatalogTenant(tenantId?: string | null): string {
  return (tenantId || readMuseumCtx()?.tenantId || "").trim();
}

export function workDetailGetOptions(tenantId?: string | null) {
  const catalogTenantId = workDetailCatalogTenant(tenantId);
  return {
    params: catalogTenantId ? { tenantId: catalogTenantId } : {},
    headers: catalogTenantId ? { "x-tenant-id": catalogTenantId } : {},
  } as const;
}
