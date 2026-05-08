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
                background: `radial-gradient(circle at 30% 30%, ${primaryColor}44, transparent), linear-gradient(135deg, #0a0a14, #050508)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${primaryColor}44`,
                boxShadow: `0 10px 40px rgba(0,0,0,0.6), inset 0 0 20px ${primaryColor}22`,
                position: "relative",
                overflow: "hidden"
            }}
        >
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
            <div 
                style={{ 
                    color: primaryColor,
                    filter: "drop-shadow(0 0 10px var(--accent-primary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <Layout size={size * 0.5} strokeWidth={1.5} />
            </div>
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
