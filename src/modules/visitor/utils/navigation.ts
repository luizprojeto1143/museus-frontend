import React from 'react';

export interface NavLink {
  to: string;
  label: string;
  icon: React.ReactNode;
  feature: string | null;
}

export const getVisitorLinks = (t: any, term: any, isCityMode: boolean): NavLink[] => [
  { to: "/home", label: t("visitor.sidebar.home", "Início"), icon: "🏠", feature: null },
  { to: "/obras", label: term.works, icon: isCityMode ? "🏛️" : "🎨", feature: "featureWorks" },
  { to: "/trilhas", label: term.trails, icon: "🗺️", feature: "featureTrails" },
  { to: "/mapa", label: t("visitor.sidebar.map", "Mapa"), icon: "📍", feature: null },
  { to: "/eventos", label: t("visitor.sidebar.events"), icon: "📅", feature: "featureEvents" },
  { to: "/desafios", label: t("visitor.sidebar.challenges", "Desafios"), icon: "🎯", feature: "featureGamification" },
  { to: "/loja", label: t("visitor.sidebar.shop", "Loja"), icon: "🛒", feature: "featureShop" },
  { to: "/ranking", label: t("visitor.sidebar.leaderboard", "Ranking"), icon: "🏆", feature: "featureGamification" },
  { to: "/favoritos", label: t("visitor.sidebar.favorites", "Favoritos"), icon: "❤️", feature: "featureReviews" },
  { to: "/chat", label: t("visitor.sidebar.aiChat", "Chat IA"), icon: "🤖", feature: "featureChatAI" },
  { to: "/scanner", label: t("visitor.sidebar.scanner", "Scanner"), icon: "📷", feature: "featureQRCodes" },
  { to: "/perfil", label: t("visitor.sidebar.profile"), icon: "👤", feature: null },
  { to: "/rpg", label: "Meu Personagem", icon: "🗡️", feature: "featureGamification" },
  { to: "/colecao", label: "Colecionáveis", icon: "✨", feature: "featureGamification" },
  { to: "/meus-certificados", label: "Meus Certificados", icon: "🏅", feature: "featureCertificates" },
];
