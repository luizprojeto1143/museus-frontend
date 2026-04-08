/**
 * Tests: errorNormalizer.ts
 */
import { describe, it, expect } from "vitest";
import { normalizeError, getErrorMessage } from "../utils/errorNormalizer";

describe("normalizeError", () => {
  it("handles Axios 404 errors", () => {
    const axiosError = {
      message: "Request failed with status code 404",
      response: { status: 404, data: { message: "Not found" } },
      config: { url: "/works/123" },
    };

    const result = normalizeError(axiosError);
    expect(result.code).toBe("NOT_FOUND");
    expect(result.status).toBe(404);
    expect(result.message).toBe("Not found");
  });

  it("handles Axios 401 errors", () => {
    const axiosError = {
      message: "Unauthorized",
      response: { status: 401, data: {} },
      config: { url: "/auth/me" },
    };

    const result = normalizeError(axiosError);
    expect(result.code).toBe("UNAUTHORIZED");
    expect(result.status).toBe(401);
  });

  it("handles Axios 500 server errors", () => {
    const axiosError = {
      message: "Internal Server Error",
      response: { status: 500, data: {} },
      config: { url: "/api/something" },
    };

    const result = normalizeError(axiosError);
    expect(result.code).toBe("SERVER_ERROR");
    expect(result.status).toBe(500);
    expect(result.message).toContain("Erro interno");
  });

  it("handles native network errors", () => {
    const networkError = new Error("Network error");
    const result = normalizeError(networkError);
    expect(result.code).toBe("NETWORK_ERROR");
    expect(result.message).toContain("conexão");
  });

  it("handles unknown errors", () => {
    const result = normalizeError(null);
    expect(result.code).toBe("UNKNOWN_ERROR");
    expect(result.message).toBeTruthy();
  });

  it("uses server message over default message", () => {
    const axiosError = {
      message: "Bad Request",
      response: { status: 400, data: { message: "E-mail já cadastrado" } },
      config: { url: "/auth/register" },
    };

    const result = normalizeError(axiosError);
    expect(result.message).toBe("E-mail já cadastrado");
  });
});

describe("getErrorMessage", () => {
  it("returns a string from any error", () => {
    const msg = getErrorMessage(new Error("Test error"));
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("returns fallback for null", () => {
    const msg = getErrorMessage(null, "Fallback message");
    expect(msg).toBe("Fallback message");
  });
});
