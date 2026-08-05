import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Landmark, Smartphone } from "lucide-react";
import "./QRCodeArtCard.css";

interface QRCodeArtCardProps {
  title: string;
  subtitle?: string;
  code: string;
  url: string;
  typeLabel?: string;
  instruction?: string;
  brand?: string;
  className?: string;
}

export const QRCodeArtCard = React.forwardRef<HTMLDivElement, QRCodeArtCardProps>(({
  title,
  subtitle,
  code,
  url,
  typeLabel = "Obra",
  instruction = "Aponte a camera para acessar",
  brand = "Cultura Viva",
  className = "",
}, ref) => {
  return (
    <div ref={ref} className={`qr-art-board ${className}`}>
      <div className="qr-art-paper">
        <header className="qr-art-brand">
          <div className="qr-art-brand-row">
            <span className="qr-art-leaf">‹</span>
            <Landmark size={34} strokeWidth={1.7} />
            <span className="qr-art-leaf">›</span>
          </div>
          <strong>{brand}</strong>
        </header>

        <div className="qr-art-rule">
          <span />
        </div>

        <section className="qr-art-title-block">
          <h2>{title || "Nome da Obra"}</h2>
          {subtitle && <p>{subtitle}</p>}
          <small>{typeLabel} n° {code}</small>
        </section>

        <div className="qr-art-rule qr-art-rule-short">
          <span />
        </div>

        <div className="qr-art-code-wrap">
          <QRCodeCanvas
            value={url}
            size={306}
            level="H"
            fgColor="#2f261b"
            bgColor="#fbf6eb"
            includeMargin
          />
        </div>

        <footer className="qr-art-footer">
          <Smartphone size={34} strokeWidth={1.7} />
          <span>{instruction}</span>
        </footer>
      </div>
      <div className="qr-art-ornament" aria-hidden="true">
        <span />
      </div>
    </div>
  );
});

QRCodeArtCard.displayName = "QRCodeArtCard";
