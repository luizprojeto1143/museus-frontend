export type Role =
  | "visitor"
  | "master"
  | "municipal_admin"
  | "municipal_secretary"
  | "equipment_admin"
  | "equipment_collaborator"
  | "producer"
  | "provider"
  | "sponsor"
  | "theater_admin"
  | "totem_operator"
  | "collaborator";

export type TenantType =
  | "CITY"
  | "SECRETARIA"
  | "MUSEUM"
  | "CULTURAL_SPACE"
  | "THEATER"
  | "PRODUCER"
  | "PROVIDER"
  | "SPONSOR"
  | "PLATFORM";

export type QRType =
  | "CITY"
  | "EQUIPMENT"
  | "WORK"
  | "EVENT"
  | "EXHIBITION"
  | "TRAIL"
  | "ROOM"
  | "MAP"
  | "MAP_POINT"
  | "AUDIOGUIDE"
  | "LIBRAS"
  | "TICKET"
  | "CHECKIN"
  | "SPONSORSHIP"
  | "DONATION"
  | "SHOP"
  | "SURVEY"
  | "GUESTBOOK"
  | "COUPON"
  | "CERTIFICATE"
  | "CUSTOM";

export type Permission = string;

export function normalizeRole(raw: string | null | undefined): Role {
  const role = (raw || "").toLowerCase();
  
  if (role === "admin") return "equipment_admin";
  if (role === "master") return "master";
  if (role === "producer") return "producer";
  if (role === "provider") return "provider";
  if (role === "sponsor") return "sponsor";
  if (role === "theater") return "theater_admin";
  if (role === "collaborator") return "collaborator";

  if (role === "municipal_admin") return "municipal_admin";
  if (role === "municipal_secretary") return "municipal_secretary";
  if (role === "equipment_admin") return "equipment_admin";
  if (role === "equipment_collaborator") return "equipment_collaborator";
  if (role === "theater_admin") return "theater_admin";
  if (role === "totem_operator") return "totem_operator";
  if (role === "visitor") return "visitor";

  return "visitor";
}

export function normalizeTenantType(raw: string | null | undefined): TenantType | null {
  const t = (raw || "").toUpperCase();
  
  if (t === "MUSEUM") return "MUSEUM";
  if (t === "EQUIPAMENTO") return "CULTURAL_SPACE";
  if (t === "SECRETARIA") return "SECRETARIA";
  if (t === "CITY") return "CITY";
  if (t === "THEATER") return "THEATER";
  if (t === "PRODUCER") return "PRODUCER";
  if (t === "PROVIDER") return "PROVIDER";
  if (t === "SPONSOR") return "SPONSOR";
  if (t === "PLATFORM") return "PLATFORM";
  if (t === "CULTURAL_SPACE") return "CULTURAL_SPACE";

  if (t) return "MUSEUM"; 
  return null;
}
