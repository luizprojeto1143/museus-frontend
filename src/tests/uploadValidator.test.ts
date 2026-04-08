/**
 * Tests: uploadValidator.ts
 */
import { describe, it, expect } from "vitest";
import {
  validateFile,
  UPLOAD_PRESETS,
  formatFileSize,
  getFileTypeLabel,
} from "../utils/uploadValidator";

// Helper to create fake File objects with a mocked size
function makeFile(name: string, type: string, sizeBytes: number): File {
  // Create a minimal real file, then override size via prototype trick
  const file = new File([""], name, { type });
  Object.defineProperty(file, "size", { value: sizeBytes, configurable: true });
  return file;
}

describe("formatFileSize", () => {
  it("formats bytes", () => expect(formatFileSize(512)).toBe("512 B"));
  it("formats KB", () => expect(formatFileSize(1536)).toBe("1.5 KB"));
  it("formats MB", () => expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB"));
});

describe("getFileTypeLabel", () => {
  it("identifies images", () => expect(getFileTypeLabel("image/png")).toBe("Imagem"));
  it("identifies audio", () => expect(getFileTypeLabel("audio/mpeg")).toBe("Áudio"));
  it("identifies video", () => expect(getFileTypeLabel("video/mp4")).toBe("Vídeo"));
  it("identifies PDF", () => expect(getFileTypeLabel("application/pdf")).toBe("PDF"));
  it("handles unknown", () => expect(getFileTypeLabel("application/x-unknown")).toBe("Arquivo"));
});

describe("validateFile — imageOnly preset", () => {
  const config = UPLOAD_PRESETS.imageOnly;

  it("accepts valid JPEG under size limit", () => {
    const file = makeFile("photo.jpg", "image/jpeg", 1 * 1024 * 1024); // 1 MB
    const result = validateFile(file, config);
    expect(result.valid).toBe(true);
  });

  it("rejects PDF (wrong type)", () => {
    const file = makeFile("doc.pdf", "application/pdf", 500 * 1024);
    const result = validateFile(file, config);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/tipo/i);
  });

  it("rejects oversized image", () => {
    const file = makeFile("huge.png", "image/png", 11 * 1024 * 1024); // 11 MB > 10 MB limit
    const result = validateFile(file, config);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/grande/i);
  });

  it("warns for large file (>75% of limit)", () => {
    const file = makeFile("big.jpg", "image/jpeg", 8 * 1024 * 1024); // 8 MB = 80% of 10 MB
    const result = validateFile(file, config);
    expect(result.valid).toBe(true);
    expect(result.warning).toBeTruthy();
  });

  it("no warning for small file", () => {
    const file = makeFile("small.jpg", "image/jpeg", 1 * 1024 * 1024); // 1 MB
    const result = validateFile(file, config);
    expect(result.valid).toBe(true);
    expect(result.warning).toBeUndefined();
  });
});

describe("validateFile — general preset", () => {
  const config = UPLOAD_PRESETS.general;

  it("accepts MP4 video", () => {
    const file = makeFile("video.mp4", "video/mp4", 20 * 1024 * 1024);
    const result = validateFile(file, config);
    expect(result.valid).toBe(true);
  });

  it("accepts MP3 audio", () => {
    const file = makeFile("audio.mp3", "audio/mpeg", 5 * 1024 * 1024);
    const result = validateFile(file, config);
    expect(result.valid).toBe(true);
  });

  it("rejects executable file", () => {
    const file = makeFile("malware.exe", "application/x-msdownload", 1024);
    const result = validateFile(file, config);
    expect(result.valid).toBe(false);
  });
});
