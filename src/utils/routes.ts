/**
 * Route builders para padronizar links em todo o sistema.
 * Substitui navegações via template strings hardcoded.
 */

export const buildCityUrl = (citySlug: string) => `/cidades/${citySlug}`;

export const buildCityEquipmentsUrl = (citySlug: string) => `/cidades/${citySlug}/equipamentos`;

export const buildEquipmentUrl = (citySlug: string, equipmentSlug: string) => `/cidades/${citySlug}/equipamentos/${equipmentSlug}`;

export const buildWorkUrl = (citySlug: string, equipmentSlug: string, workId: string) => `/cidades/${citySlug}/equipamentos/${equipmentSlug}/obras/${workId}`;

export const buildEventUrl = (citySlug: string, equipmentSlug: string, eventId: string) => `/cidades/${citySlug}/equipamentos/${equipmentSlug}/eventos/${eventId}`;

export const buildTrailUrl = (citySlug: string, equipmentSlug: string, trailId: string) => `/cidades/${citySlug}/equipamentos/${equipmentSlug}/trilhas/${trailId}`;

export const buildCityMapUrl = (citySlug: string) => `/cidades/${citySlug}/mapa`;

export const buildMuseumMapUrl = (citySlug: string, equipmentSlug: string) => `/cidades/${citySlug}/equipamentos/${equipmentSlug}/mapa`;

export const buildScannerUrl = (citySlug: string, equipmentSlug: string) => `/cidades/${citySlug}/equipamentos/${equipmentSlug}/scanner`;

export const buildPassportUrl = (citySlug?: string, equipmentSlug?: string) => {
  if (citySlug && equipmentSlug) return `/cidades/${citySlug}/equipamentos/${equipmentSlug}/passaporte`;
  if (citySlug) return `/cidades/${citySlug}/passaporte`;
  return '/passaporte';
};
