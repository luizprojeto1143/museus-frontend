/**
 * Extrai o código puro de um QR Code lido, independentemente do formato.
 * Formatos suportados:
 * - "ABC123"
 * - "/qr/ABC123"
 * - "https://dominio.com/qr/ABC123"
 * - "https://dominio.com/api/qrcodes/ABC123"
 */
export function extractQRCode(rawValue: string): string | null {
  if (!rawValue) return null;

  try {
    // If it's a full URL
    if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) {
      const url = new URL(rawValue);
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[parts.length - 1] || null;
    }

    // If it's a relative path
    if (rawValue.startsWith('/')) {
      const parts = rawValue.split('/').filter(Boolean);
      return parts[parts.length - 1] || null;
    }

    // If it's just the code itself
    return rawValue.trim();
  } catch (e) {
    // Fallback if URL parsing fails but string is valid
    const parts = rawValue.split('/').filter(Boolean);
    return parts[parts.length - 1] || rawValue.trim();
  }
}
