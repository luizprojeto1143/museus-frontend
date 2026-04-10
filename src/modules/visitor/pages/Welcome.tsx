import { useTenant } from "../../auth/TenantContext";
import { TenantLogo } from "../../../components/Branding/TenantLogo";

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { enterAsGuest } = useAuth();
  const tenant = useTenant();

  return (
    <div className="welcome-container">
      <div className="welcome-texture"></div>

      <div className="welcome-lang-switcher">
        <LanguageSwitcher />
      </div>

      {/* Logo e título dinâmicos */}
      <div className="welcome-hero">
        <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center" }}>
          <TenantLogo size={80} showText={false} />
        </div>
        <h1 className="welcome-title">
           {tenant?.name || t("welcome.title")}
        </h1>
        <p className="welcome-subtitle">{t("welcome.subtitle")}</p>
      </div>

      {/* Botão principal de destaque */}
      <button
        onClick={() => navigate("/select-museum")}
        className="welcome-primary-btn"
      >
        <Smartphone size={24} /> {t("welcome.explore")}
      </button>

      {/* Grupo de ações secundárias */}
      <div className="welcome-actions-group">
        <button
          onClick={() => navigate("/events")}
          className="welcome-secondary-btn agenda"
        >
          <Smartphone size={18} /> Agenda Cultural
        </button>

        <button
          onClick={() => navigate("/select-museum")}
          className="welcome-secondary-btn guest"
        >
          <Eye size={18} /> Explorar sem Conta
        </button>

        <button
          onClick={() => navigate("/login")}
          className="welcome-secondary-btn login"
        >
          <Lock size={14} /> {t("welcome.login")}
        </button>
      </div>

      {/* Decorações discretas baseadas na cor primária */}
      <div className="welcome-decor top-left" style={{ opacity: 0.1, color: "var(--accent-primary)" }}>✦</div>
      <div className="welcome-decor bottom-right" style={{ opacity: 0.1, color: "var(--accent-primary)" }}>✦</div>
    </div>
  );
};
