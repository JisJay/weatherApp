import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { login, register, AuthError, AuthResponse } from "../authApi";

const mockAuthResponse: AuthResponse = {
  token: "test-jwt-token",
  user: { id: "1", name: "Jane Smith", email: "jane@example.com" },
};

function mockFetch(status: number, body: unknown): void {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

function mockFetchNetworkError(): void {
  global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
}

afterEach(() => vi.resetAllMocks());

// ─── AuthError class ──────────────────────────────────────────────────────────

describe("AuthError", () => {
  it("sets name to AuthError", () => {
    const err = new AuthError("oops", "UNKNOWN");
    expect(err.name).toBe("AuthError");
  });

  it("sets message correctly", () => {
    const err = new AuthError("bad credentials", "INVALID_CREDENTIALS");
    expect(err.message).toBe("bad credentials");
  });

  it("sets code correctly", () => {
    const err = new AuthError("taken", "EMAIL_TAKEN");
    expect(err.code).toBe("EMAIL_TAKEN");
  });

  it("is an instance of Error", () => {
    const err = new AuthError("oops", "UNKNOWN");
    expect(err).toBeInstanceOf(Error);
  });

  it("supports all valid codes", () => {
    const codes = ["INVALID_CREDENTIALS", "EMAIL_TAKEN", "NETWORK", "UNKNOWN"] as const;
    codes.forEach((code) => {
      const err = new AuthError("msg", code);
      expect(err.code).toBe(code);
    });
  });
});

// ─── login ───────────────────────────────────────────────────────────────────

describe("login", () => {
  it("returns AuthResponse on 200", async () => {
    mockFetch(200, mockAuthResponse);
    const result = await login("jane@example.com", "password123");
    expect(result).toEqual(mockAuthResponse);
  });

  it("POSTs to /api/auth/login", async () => {
    mockFetch(200, mockAuthResponse);
    await login("jane@example.com", "password123");
    const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/auth/login");
  });

  it("sends method POST", async () => {
    mockFetch(200, mockAuthResponse);
    await login("jane@example.com", "password123");
    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.method).toBe("POST");
  });

  it("sends Content-Type: application/json header", async () => {
    mockFetch(200, mockAuthResponse);
    await login("jane@example.com", "password123");
    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.headers["Content-Type"]).toBe("application/json");
  });

  it("sends email and password in body", async () => {
    mockFetch(200, mockAuthResponse);
    await login("jane@example.com", "password123");
    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({
      email: "jane@example.com",
      password: "password123",
    });
  });

  it("throws AuthError INVALID_CREDENTIALS on 401", async () => {
    mockFetch(401, { message: "Invalid" });
    await expect(login("bad@example.com", "wrong")).rejects.toMatchObject({
      name: "AuthError",
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
    });
  });

  it("throws AuthError INVALID_CREDENTIALS which is an AuthError instance", async () => {
    mockFetch(401, {});
    const err = await login("x@x.com", "pass").catch((e) => e);
    expect(err).toBeInstanceOf(AuthError);
  });

  it("throws AuthError UNKNOWN on 500", async () => {
    mockFetch(500, {});
    await expect(login("jane@example.com", "password123")).rejects.toMatchObject({
      code: "UNKNOWN",
      message: "An unexpected error occurred.",
    });
  });

  it("throws AuthError UNKNOWN on 403", async () => {
    mockFetch(403, {});
    await expect(login("jane@example.com", "password123")).rejects.toMatchObject({
      code: "UNKNOWN",
    });
  });

  it("throws AuthError NETWORK on network failure", async () => {
    mockFetchNetworkError();
    await expect(login("jane@example.com", "password123")).rejects.toMatchObject({
      code: "NETWORK",
      message: "Network error. Check your connection.",
    });
  });

  it("NETWORK error is an AuthError instance", async () => {
    mockFetchNetworkError();
    const err = await login("jane@example.com", "password123").catch((e) => e);
    expect(err).toBeInstanceOf(AuthError);
  });
});

// ─── register ────────────────────────────────────────────────────────────────

describe("register", () => {
  it("returns AuthResponse on 201", async () => {
    mockFetch(201, mockAuthResponse);
    const result = await register("Jane Smith", "jane@example.com", "password123");
    expect(result).toEqual(mockAuthResponse);
  });

  it("returns AuthResponse on 200 as well", async () => {
    mockFetch(200, mockAuthResponse);
    const result = await register("Jane Smith", "jane@example.com", "password123");
    expect(result).toEqual(mockAuthResponse);
  });

  it("POSTs to /api/auth/register", async () => {
    mockFetch(201, mockAuthResponse);
    await register("Jane Smith", "jane@example.com", "password123");
    const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/auth/register");
  });

  it("sends method POST", async () => {
    mockFetch(201, mockAuthResponse);
    await register("Jane Smith", "jane@example.com", "password123");
    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.method).toBe("POST");
  });

  it("sends Content-Type: application/json header", async () => {
    mockFetch(201, mockAuthResponse);
    await register("Jane Smith", "jane@example.com", "password123");
    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.headers["Content-Type"]).toBe("application/json");
  });

  it("sends name, email, and password in body", async () => {
    mockFetch(201, mockAuthResponse);
    await register("Jane Smith", "jane@example.com", "password123");
    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({
      name: "Jane Smith",
      email: "jane@example.com",
      password: "password123",
    });
  });

  it("throws AuthError EMAIL_TAKEN on 409", async () => {
    mockFetch(409, {});
    await expect(
      register("Jane Smith", "jane@example.com", "password123")
    ).rejects.toMatchObject({
      name: "AuthError",
      code: "EMAIL_TAKEN",
      message: "An account with this email already exists.",
    });
  });

  it("EMAIL_TAKEN error is an AuthError instance", async () => {
    mockFetch(409, {});
    const err = await register("Jane", "jane@example.com", "pass").catch((e) => e);
    expect(err).toBeInstanceOf(AuthError);
  });

  it("throws AuthError UNKNOWN on 500", async () => {
    mockFetch(500, {});
    await expect(
      register("Jane Smith", "jane@example.com", "password123")
    ).rejects.toMatchObject({
      code: "UNKNOWN",
      message: "An unexpected error occurred.",
    });
  });

  it("throws AuthError UNKNOWN on 400", async () => {
    mockFetch(400, {});
    await expect(
      register("Jane Smith", "jane@example.com", "password123")
    ).rejects.toMatchObject({ code: "UNKNOWN" });
  });

  it("throws AuthError NETWORK on network failure", async () => {
    mockFetchNetworkError();
    await expect(
      register("Jane Smith", "jane@example.com", "password123")
    ).rejects.toMatchObject({
      code: "NETWORK",
      message: "Network error. Check your connection.",
    });
  });

  it("NETWORK error is an AuthError instance", async () => {
    mockFetchNetworkError();
    const err = await register("Jane", "jane@example.com", "pass").catch((e) => e);
    expect(err).toBeInstanceOf(AuthError);
  });
});
