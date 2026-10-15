import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { saveSession } from "../../utils/session";
import AuthShell from "./AuthShell";
import Field from "../ui/Field";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await login(email, password);

      saveSession(data);
      // purani keys, agar baaki code abhi unpe depend kare
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      navigate("/chat", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your account"
      subtitle="Continue your conversations right where you left off."
      footer={
        <>
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-line" />
            <span className="text-[11px] font-medium tracking-wider text-muted">
              NEW TO CHATEASE?
            </span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <Link
            to="/register"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-line bg-surface text-sm font-semibold shadow-soft transition hover:bg-surface-2"
          >
            Create a new account
          </Link>

          <p className="mt-6 text-center text-xs text-muted">
            Your account and conversations are protected with secure authentication.
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          id="email"
          label="Email address"
          icon={Mail}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <Field
          id="password"
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
          labelRight={
            <button
              type="button"
              className="text-xs font-semibold text-brand transition hover:text-brand-hover"
            >
              Forgot password?
            </button>
          }
          right={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="mr-2 grid size-9 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient text-sm font-semibold text-white shadow-glow transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}