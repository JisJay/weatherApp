import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import LoginForm from "../LoginForm";
import RegisterForm from "../RegisterForm";
import AuthPage from "../AuthPage";
import { AuthError, AuthResponse } from "../authApi";

// Mock authApi so component tests don't make real fetch calls
vi.mock("../authApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../authApi")>();
  return {
    ...actual,
    login: vi.fn(),
    register: vi.fn(),
  };
});

import { login, register } from "../authApi";
const mockLogin = login as ReturnType<typeof vi.fn>;
const mockRegister = register as ReturnType<typeof vi.fn>;

const mockAuthResponse: AuthResponse = {
  token: "tok",
  user: { id: "1", name: "Jane", email: "jane@example.com" },
};

afterEach(() => vi.resetAllMocks());

// ─── LoginForm ────────────────────────────────────────────────────────────────

describe("LoginForm", () => {
  const onSuccess = vi.fn();
  const onSwitch = vi.fn();

  function renderLogin() {
    return render(<LoginForm onSuccess={onSuccess} onSwitch={onSwitch} />);
  }

  it("renders heading, inputs, button and switch link", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });

  it("calls onSwitch when Register link is clicked", async () => {
    renderLogin();
    await userEvent.click(screen.getByText("Register"));
    expect(onSwitch).toHaveBeenCalledOnce();
  });

  it("submits email and password to login()", async () => {
    mockLogin.mockResolvedValue(mockAuthResponse);
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(mockLogin).toHaveBeenCalledWith("jane@example.com", "password123");
  });

  it("calls onSuccess with the auth response after successful login", async () => {
    mockLogin.mockResolvedValue(mockAuthResponse);
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(mockAuthResponse));
  });

  it("shows Signing in... while request is in flight", async () => {
    mockLogin.mockReturnValue(new Promise(() => {})); // never resolves
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
  });

  it("shows AuthError message on failed login", async () => {
    mockLogin.mockRejectedValue(new AuthError("Invalid email or password.", "INVALID_CREDENTIALS"));
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "bad@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() =>
      expect(screen.getByText("Invalid email or password.")).toBeInTheDocument()
    );
  });

  it("shows generic message for non-AuthError", async () => {
    mockLogin.mockRejectedValue(new Error("something unexpected"));
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() =>
      expect(screen.getByText("An unexpected error occurred.")).toBeInTheDocument()
    );
  });

  it("re-enables button and clears loading after error", async () => {
    mockLogin.mockRejectedValue(new AuthError("bad", "INVALID_CREDENTIALS"));
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "pass");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /sign in/i })).not.toBeDisabled());
  });
});

// ─── RegisterForm ─────────────────────────────────────────────────────────────

describe("RegisterForm", () => {
  const onSuccess = vi.fn();
  const onSwitch = vi.fn();

  function renderRegister() {
    return render(<RegisterForm onSuccess={onSuccess} onSwitch={onSwitch} />);
  }

  it("renders heading, inputs, button and switch link", () => {
    renderRegister();
    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Min. 8 characters")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it("calls onSwitch when Sign in link is clicked", async () => {
    renderRegister();
    await userEvent.click(screen.getByText("Sign in"));
    expect(onSwitch).toHaveBeenCalledOnce();
  });

  it("submits name, email and password to register()", async () => {
    mockRegister.mockResolvedValue(mockAuthResponse);
    renderRegister();
    await userEvent.type(screen.getByPlaceholderText("Jane Smith"), "Jane Smith");
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await userEvent.type(screen.getByPlaceholderText("Min. 8 characters"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(mockRegister).toHaveBeenCalledWith("Jane Smith", "jane@example.com", "password123");
  });

  it("calls onSuccess with the auth response after successful register", async () => {
    mockRegister.mockResolvedValue(mockAuthResponse);
    renderRegister();
    await userEvent.type(screen.getByPlaceholderText("Jane Smith"), "Jane Smith");
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await userEvent.type(screen.getByPlaceholderText("Min. 8 characters"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(mockAuthResponse));
  });

  it("shows Creating account... while request is in flight", async () => {
    mockRegister.mockReturnValue(new Promise(() => {}));
    renderRegister();
    await userEvent.type(screen.getByPlaceholderText("Jane Smith"), "Jane Smith");
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await userEvent.type(screen.getByPlaceholderText("Min. 8 characters"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(screen.getByRole("button", { name: /creating account/i })).toBeDisabled();
  });

  it("shows AuthError message on failed register", async () => {
    mockRegister.mockRejectedValue(
      new AuthError("An account with this email already exists.", "EMAIL_TAKEN")
    );
    renderRegister();
    await userEvent.type(screen.getByPlaceholderText("Jane Smith"), "Jane");
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await userEvent.type(screen.getByPlaceholderText("Min. 8 characters"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() =>
      expect(
        screen.getByText("An account with this email already exists.")
      ).toBeInTheDocument()
    );
  });

  it("shows generic message for non-AuthError", async () => {
    mockRegister.mockRejectedValue(new Error("network exploded"));
    renderRegister();
    await userEvent.type(screen.getByPlaceholderText("Jane Smith"), "Jane");
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await userEvent.type(screen.getByPlaceholderText("Min. 8 characters"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() =>
      expect(screen.getByText("An unexpected error occurred.")).toBeInTheDocument()
    );
  });

  it("re-enables button after error", async () => {
    mockRegister.mockRejectedValue(new AuthError("taken", "EMAIL_TAKEN"));
    renderRegister();
    await userEvent.type(screen.getByPlaceholderText("Jane Smith"), "Jane");
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await userEvent.type(screen.getByPlaceholderText("Min. 8 characters"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /create account/i })).not.toBeDisabled()
    );
  });
});

// ─── AuthPage ─────────────────────────────────────────────────────────────────

describe("AuthPage", () => {
  const onAuthenticated = vi.fn();

  function renderAuthPage() {
    return render(<AuthPage onAuthenticated={onAuthenticated} />);
  }

  it("renders the app brand heading", () => {
    renderAuthPage();
    expect(screen.getByRole("heading", { name: /weather app/i })).toBeInTheDocument();
  });

  it("shows LoginForm by default", () => {
    renderAuthPage();
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });

  it("switches to RegisterForm when Register link is clicked", async () => {
    renderAuthPage();
    await userEvent.click(screen.getByText("Register"));
    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
  });

  it("switches back to LoginForm when Sign in link is clicked", async () => {
    renderAuthPage();
    await userEvent.click(screen.getByText("Register"));
    await userEvent.click(screen.getByText("Sign in"));
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });

  it("calls onAuthenticated when login succeeds", async () => {
    mockLogin.mockResolvedValue(mockAuthResponse);
    renderAuthPage();
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith(mockAuthResponse));
  });

  it("calls onAuthenticated when register succeeds", async () => {
    mockRegister.mockResolvedValue(mockAuthResponse);
    renderAuthPage();
    await userEvent.click(screen.getByText("Register"));
    await userEvent.type(screen.getByPlaceholderText("Jane Smith"), "Jane Smith");
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    await userEvent.type(screen.getByPlaceholderText("Min. 8 characters"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith(mockAuthResponse));
  });
});
