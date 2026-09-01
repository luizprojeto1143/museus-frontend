import React from 'react';
import type { TFunction } from 'i18next';
import type { Terminology } from '../../../hooks/useTerminology';
import { buildEquipmentUrl, buildMuseumMapUrl, buildScannerUrl } from '@/utils/routes';
import { readMuseumCtx, isUsableSlug } from '@/config/golive';

export interface NavLink {
  to: string;
  label: string;
  icon: React.ReactNode;
  feature: string | null;
}

export const getVisitorLinks = (t: TFunction, term: Terminology, isCityMode: boolean): NavLink[] => {
  const _t = (key: string, fallback?: string) => t(key, fallback || key);
  const ctx = readMuseumCtx();
  const hasSlugs = Boolean(ctx && isUsableSlug(ctx.citySlug) && isUsableSlug(ctx.equipmentSlug));
  const base = hasSlugs && ctx ? buildEquipmentUrl(ctx.citySlug, ctx.equipmentSlug) : null;
  return [
    { to: base || "/hub", label: _t("visitor.sidebar.home", "Início"), icon: "🏠", feature: null },
    { to: base ? `${base}/obras` : "/select-museum", label: term.works, icon: isCityMode ? "🏛️" : "🎨", feature: "featureWorks" },
    { to: base ? `${base}/trilhas` : "/select-museum", label: term.trails, icon: "🗺️", feature: "featureTrails" },
    { to: ctx && hasSlugs ? buildMuseumMapUrl(ctx.citySlug, ctx.equipmentSlug) : "/select-museum", label: _t("visitor.sidebar.map", "Mapa"), icon: "📍", feature: null },
    { to: "/agenda", label: "Agenda Cultural", icon: "🎫", feature: null },
    { to: "/meus-ingressos", label: "Meus Ingressos", icon: "🎫", feature: null },
    { to: base ? `${base}/eventos` : "/select-museum", label: _t("visitor.sidebar.events"), icon: "📅", feature: "featureEvents" },
    { to: "/desafios", label: _t("visitor.sidebar.challenges", "Desafios"), icon: "🎯", feature: "featureGamification" },
    { to: "/loja", label: _t("visitor.sidebar.shop", "Loja"), icon: "🛒", feature: "featureShop" },
    { to: "/ranking", label: _t("visitor.sidebar.leaderboard", "Ranking"), icon: "🏆", feature: "featureGamification" },
    { to: "/favoritos", label: _t("visitor.sidebar.favorites", "Favoritos"), icon: "❤️", feature: "featureReviews" },
    { to: "/chat", label: _t("visitor.sidebar.aiChat", "Chat IA"), icon: "🤖", feature: "featureChatAI" },
    { to: ctx && hasSlugs ? buildScannerUrl(ctx.citySlug, ctx.equipmentSlug) : "/scanner", label: _t("visitor.sidebar.scanner", "Scanner"), icon: "📷", feature: "featureQRCodes" },
    { to: "/perfil", label: _t("visitor.sidebar.profile"), icon: "👤", feature: null },
    { to: "/rpg", label: "Meu Personagem", icon: "🗡️", feature: "featureGamification" },
    { to: "/colecao", label: "Colecionáveis", icon: "✨", feature: "featureGamification" },
    { to: "/meus-certificados", label: "Meus Certificados", icon: "🏅", feature: "featureCertificates" },
    { to: "/cracha", label: "Crachá Real", icon: "🛡️", feature: null },
    { to: "/professor", label: "Portal do Professor", icon: "🎓", feature: "teacherOnly" },
    { to: "/passaporte", label: "Passaporte", icon: "🎫", feature: null },
  ];
};
