import { buildEquipmentUrl, buildMuseumMapUrl, buildScannerUrl } from '@/utils/routes';

export const getCityContextLinks = (_citySlug: string) => [] as { id: string; label: string; path: string }[];

export const getEquipmentContextLinks = (citySlug: string, equipmentSlug: string) => [
  { id: 'eq-hub', label: '🏛️ Início do Museu', path: buildEquipmentUrl(citySlug, equipmentSlug) },
  { id: 'eq-works', label: '🎨 Obras', path: `${buildEquipmentUrl(citySlug, equipmentSlug)}/obras` },
  { id: 'eq-events', label: '📅 Eventos', path: `${buildEquipmentUrl(citySlug, equipmentSlug)}/eventos` },
  { id: 'eq-trails', label: '🗺️ Trilhas', path: `${buildEquipmentUrl(citySlug, equipmentSlug)}/trilhas` },
  { id: 'eq-map', label: '📍 Mapa Interno', path: buildMuseumMapUrl(citySlug, equipmentSlug) },
  { id: 'eq-scanner', label: '📷 Scanner', path: buildScannerUrl(citySlug, equipmentSlug) },
];
