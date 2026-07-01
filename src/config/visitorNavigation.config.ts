import { buildCityUrl, buildEquipmentUrl, buildCityMapUrl, buildMuseumMapUrl, buildScannerUrl } from '@/utils/routes';

export const getCityContextLinks = (citySlug: string) => [
  { id: 'city-hub', label: '📍 Hub da Cidade', path: buildCityUrl(citySlug) },
  { id: 'city-map', label: '🗺️ Mapa Cultural', path: buildCityMapUrl(citySlug) },
  { id: 'city-agenda', label: '📅 Agenda', path: `${buildCityUrl(citySlug)}/agenda` },
  { id: 'city-trails', label: '🛤️ Roteiros', path: `${buildCityUrl(citySlug)}/roteiros` },
  { id: 'city-ranking', label: '🏆 Ranking', path: `${buildCityUrl(citySlug)}/ranking` },
  { id: 'city-equipments', label: '🏛️ Equipamentos', path: `${buildCityUrl(citySlug)}/equipamentos` }
];

export const getEquipmentContextLinks = (citySlug: string, equipmentSlug: string) => [
  { id: 'eq-hub', label: '🏛️ Início do Museu', path: buildEquipmentUrl(citySlug, equipmentSlug) },
  { id: 'eq-works', label: '🎨 Obras', path: `${buildEquipmentUrl(citySlug, equipmentSlug)}/obras` },
  { id: 'eq-events', label: '📅 Eventos', path: `${buildEquipmentUrl(citySlug, equipmentSlug)}/eventos` },
  { id: 'eq-trails', label: '🗺️ Trilhas', path: `${buildEquipmentUrl(citySlug, equipmentSlug)}/trilhas` },
  { id: 'eq-map', label: '📍 Mapa Interno', path: buildMuseumMapUrl(citySlug, equipmentSlug) },
  { id: 'eq-scanner', label: '📷 Scanner', path: buildScannerUrl(citySlug, equipmentSlug) },
];
