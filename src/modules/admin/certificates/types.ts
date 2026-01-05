export type ElementType = 'text' | 'variable' | 'qrcode' | 'image';

export interface CertificateElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotate?: number; // New: Rotation support

    // Content
    text?: string;
    src?: string; // For images

    // Style
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    align?: 'left' | 'center' | 'right';
    opacity?: number;

    // Metadata
    isLocked?: boolean; // New: Lock movement
}

export interface CertificateTemplate {
    id?: string;
    name: string;
    backgroundUrl: string;
    elements: CertificateElement[];
    dimensions: {
        width: number;
        height: number;
    };
}
