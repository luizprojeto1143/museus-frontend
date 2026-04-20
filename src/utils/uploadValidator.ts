/**
 * Upload Validator — Cultura Viva
 *
 * Validates files before upload: MIME type, size, dimensions (for images).
 * Centralizes all upload restrictions in one place for easy maintenance.
 */

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
  /** Warning (non-blocking, e.g., "large file may take longer to upload") */
  warning?: string;
}

export interface UploadConfig {
  /** Allowed MIME types (e.g. ["image/jpeg", "image/png", "audio/mpeg"]) */
  allowedTypes: ReadonlyArray<string>;
  /** Maximum file size in bytes (default: 10 MB) */
  maxBytes?: number;
  /** Maximum image width in pixels (only for images) */
  maxImageWidth?: number;
  /** Maximum image height in pixels (only for images) */
  maxImageHeight?: number;
}

// ─── Preset Configs ───────────────────────────────────────────────

export const UPLOAD_PRESETS = {
  /** General purpose: images, audio, video, 3D */
  general: {
    allowedTypes: [
      "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
      "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg",
      "video/mp4", "video/webm",
      "model/gltf-binary", "model/gltf+json", ".glb", ".gltf"
    ],
    maxBytes: 100 * 1024 * 1024, // 100 MB (increased for 3D)
  },

  /** 3D Models only */
  model3DOnly: {
    allowedTypes: ["model/gltf-binary", "model/gltf+json", ".glb", ".gltf"],
    maxBytes: 100 * 1024 * 1024, // 100 MB
  },

  /** Images only */
  imageOnly: {
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    maxBytes: 10 * 1024 * 1024, // 10 MB
    maxImageWidth: 4096,
    maxImageHeight: 4096,
  },

  /** Audio only */
  audioOnly: {
    allowedTypes: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"],
    maxBytes: 25 * 1024 * 1024, // 25 MB
  },

  /** Video only */
  videoOnly: {
    allowedTypes: ["video/mp4", "video/webm"],
    maxBytes: 100 * 1024 * 1024, // 100 MB
  },

  /** PDF documents */
  pdfOnly: {
    allowedTypes: ["application/pdf"],
    maxBytes: 20 * 1024 * 1024, // 20 MB
  },
} as const;

// ─── Validators ───────────────────────────────────────────────────

/** Formats bytes into human-readable string */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Gets a human-readable type label */
export function getFileTypeLabel(type: string): string {
  if (type.startsWith("image/")) return "Imagem";
  if (type.startsWith("audio/")) return "Áudio";
  if (type.startsWith("video/")) return "Vídeo";
  if (type.startsWith("model/") || type.endsWith(".glb") || type.endsWith(".gltf")) return "Modelo 3D";
  if (type === "application/pdf") return "PDF";
  return "Arquivo";
}

/**
 * Validates a single file against the given config.
 * Returns synchronously for type/size checks, use validateFileAsync for image dimension checks.
 */
export function validateFile(
  file: File,
  config: UploadConfig
): UploadValidationResult {
  const maxBytes = config.maxBytes ?? 10 * 1024 * 1024;

  // ─── MIME type check ────────────────────────────────────────
  const isTypeAllowed = config.allowedTypes.some(allowed => {
    if (allowed.endsWith("/*")) {
      return file.type.startsWith(allowed.replace("/*", "/"));
    }
    return file.type === allowed;
  });

  if (!isTypeAllowed) {
    const allowedLabels = [...new Set(config.allowedTypes.map(getFileTypeLabel))].join(", ");
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedLabels}. Seu arquivo: ${file.type || "desconhecido"}`,
    };
  }

  // ─── Size check ─────────────────────────────────────────────
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Arquivo muito grande (${formatFileSize(file.size)}). Limite: ${formatFileSize(maxBytes)}`,
    };
  }

  // ─── Large file warning (>75% of limit) ─────────────────────
  const warning =
    file.size > maxBytes * 0.75
      ? `Arquivo grande (${formatFileSize(file.size)}) — o upload pode demorar.`
      : undefined;

  return { valid: true, warning };
}

/**
 * Async version that also checks image dimensions.
 * Must be awaited before proceeding with the upload.
 */
export async function validateFileAsync(
  file: File,
  config: UploadConfig
): Promise<UploadValidationResult> {
  // Run sync checks first
  const syncResult = validateFile(file, config);
  if (!syncResult.valid) return syncResult;

  // Image dimension check
  if (
    file.type.startsWith("image/") &&
    (config.maxImageWidth || config.maxImageHeight)
  ) {
    const dimensions = await getImageDimensions(file);
    if (dimensions) {
      if (config.maxImageWidth && dimensions.width > config.maxImageWidth) {
        return {
          valid: false,
          error: `Imagem muito larga (${dimensions.width}px). Máximo: ${config.maxImageWidth}px`,
        };
      }
      if (config.maxImageHeight && dimensions.height > config.maxImageHeight) {
        return {
          valid: false,
          error: `Imagem muito alta (${dimensions.height}px). Máximo: ${config.maxImageHeight}px`,
        };
      }
    }
  }

  return syncResult;
}

/** Validates multiple files and returns all errors */
export async function validateFiles(
  files: File[],
  config: UploadConfig
): Promise<{ file: File; result: UploadValidationResult }[]> {
  return Promise.all(
    files.map(async file => ({
      file,
      result: await validateFileAsync(file, config),
    }))
  );
}

// ─── Helpers ──────────────────────────────────────────────────────

function getImageDimensions(
  file: File
): Promise<{ width: number; height: number } | null> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * Creates an object URL preview for a file (image, audio, or video).
 * Remember to call `URL.revokeObjectURL(url)` when done.
 */
export function createFilePreview(file: File): string {
  return URL.createObjectURL(file);
}
