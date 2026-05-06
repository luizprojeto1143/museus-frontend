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
    
    // Fallback Icon/Abstract Logo if no URL is provided
    const renderFallback = () => (
        <div 
            style={{ 
                width: size, 
                height: size, 
                borderRadius: "32%", 
                background: `radial-gradient(circle at 30% 30%, ${primaryColor}55, transparent), linear-gradient(135deg, #1a1a2e, #0a0a0e)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${primaryColor}33`,
                boxShadow: `0 10px 30px rgba(0,0,0,0.5), inset 0 0 15px ${primaryColor}11`,
                position: "relative",
                overflow: "hidden"
            }}
        >
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
            <Layout size={size * 0.5} color={primaryColor} className="drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
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
