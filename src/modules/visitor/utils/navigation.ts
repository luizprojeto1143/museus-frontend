import React from 'react';

export interface NavLink {
  to: string;
  label: string;
  icon: React.ReactNode;
  feature: string | null;
}

export const getVisitorLinks = (t: any, term: any, isCityMode: boolean): NavLink[] => {
  const _t = typeof t === 'function' ? t : (k: string, d: string) => d;
  return [
    { to: "/home", label: _t("visitor.sidebar.home", "Início"), icon: "🏠", feature: null },
  { to: "/obras", label: term.works, icon: isCityMode ? "🏛️" : "🎨", feature: "featureWorks" },
  { to: "/trilhas", label: term.trails, icon: "🗺️", feature: "featureTrails" },
    { to: "/mapa", label: _t("visitor.sidebar.map", "Mapa"), icon: "📍", feature: null },
    { to: "/agenda", label: "Agenda Cultural", icon: "🎟️", feature: null },
    { to: "/meus-ingressos", label: "Meus Ingressos", icon: "🎫", feature: null },
    { to: "/eventos", label: _t("visitor.sidebar.events"), icon: "📅", feature: "featureEvents" },
    { to: "/desafios", label: _t("visitor.sidebar.challenges", "Desafios"), icon: "🎯", feature: "featureGamification" },
    { to: "/loja", label: _t("visitor.sidebar.shop", "Loja"), icon: "🛒", feature: "featureShop" },
    { to: "/ranking", label: _t("visitor.sidebar.leaderboard", "Ranking"), icon: "🏆", feature: "featureGamification" },
    { to: "/favoritos", label: _t("visitor.sidebar.favorites", "Favoritos"), icon: "❤️", feature: "featureReviews" },
    { to: "/chat", label: _t("visitor.sidebar.aiChat", "Chat IA"), icon: "🤖", feature: "featureChatAI" },
    { to: "/scanner", label: _t("visitor.sidebar.scanner", "Scanner"), icon: "📷", feature: "featureQRCodes" },
    { to: "/perfil", label: _t("visitor.sidebar.profile"), icon: "👤", feature: null },
    { to: "/rpg", label: "Meu Personagem", icon: "🗡️", feature: "featureGamification" },
    { to: "/colecao", label: "Colecionáveis", icon: "✨", feature: "featureGamification" },
    { to: "/meus-certificados", label: "Meus Certificados", icon: "🏅", feature: "featureCertificates" },
    { to: "/cracha", label: "Crachá Real", icon: "🛡️", feature: null },
    { to: "/professor", label: "Portal do Professor", icon: "🎓", feature: "teacherOnly" },
  ];
};
