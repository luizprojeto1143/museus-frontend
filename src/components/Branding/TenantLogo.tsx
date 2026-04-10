import React from "react";
import { useTenant } from "../../modules/auth/TenantContext";
import { Layout } from "lucide-react";

interface TenantLogoProps {
    className?: string;
    style?: React.CSSProperties;
    showText?: boolean;
    size?: number;
}

/**
 * TenantLogo Component
 * Renders the tenant's brand logo from URL, or a fallback stylized icon.
 */
export const TenantLogo: React.FC<TenantLogoProps> = ({ 
    className = "", 
    style = {}, 
    showText = true,
    size = 32
}) => {
    const tenant = useTenant();

    const primaryColor = tenant?.primaryColor || "var(--accent-primary)";
    
    // Fallback Icon/Abstrct Logo if no URL is provided
    const renderFallback = () => (
        <div 
            style={{ 
                width: size, 
                height: size, 
                borderRadius: "50%", 
                background: `linear-gradient(135deg, ${primaryColor}, transparent)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${primaryColor}`,
                boxShadow: `0 0 15px ${primaryColor}44`
            }}
        >
            <Layout size={size * 0.6} color={primaryColor} />
        </div>
    );

    return (
        <div 
            className={`tenant-logo-container ${className}`}
            style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.75rem",
                cursor: "pointer",
                ...style 
            }}
        >
            {tenant?.logoUrl ? (
                <img 
                    src={tenant.logoUrl} 
                    alt={tenant.name || "Logo"} 
                    style={{ height: size, width: "auto", borderRadius: "8px", objectFit: "contain" }}
                />
            ) : (
                renderFallback()
            )}
            
            {showText && (
                <span style={{ 
                    fontSize: `${size * 0.5}px`, 
                    fontWeight: "bold", 
                    color: "var(--fg-main)",
                    fontFamily: "var(--font-heading)",
                    letterSpacing: "1px"
                }}>
                    {tenant?.name || "Cultura Viva"}
                </span>
            )}
        </div>
    );
};
