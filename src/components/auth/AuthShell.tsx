import type { ReactNode } from "react";
import { CheckCheck, ShieldCheck, Zap } from "lucide-react";
import Avatar from "../ui/Avatar";
import Logo from "../ui/Logo";

interface Props {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

const PANEL_BG = {
  backgroundImage:
    "radial-gradient(60% 50% at 15% 0%, rgba(16,185,129,0.38), transparent 60%), radial-gradient(45% 40% at 100% 100%, rgba(45,212,191,0.22), transparent 60%)",
};

const GRID = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "44px 44px",
  maskImage: "radial-gradient(ellipse at center, black 25%, transparent 72%)",
  WebkitMaskImage: "radial-gradient(ellipse at center, black 25%, transparent 72%)",
};

const CHIPS = [
  { icon: Zap, text: "Real-time" },
  { icon: CheckCheck, text: "Read receipts" },
  { icon: ShieldCheck, text: "Private by design" },
];

export default function AuthShell({ eyebrow, title, subtitle, children, footer }: Props) {
  return (
    <div className="grid min-h-dvh bg-bg text-fg lg:grid-cols-2">
      {/* Brand panel */}
      <section
        className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between"
        style={PANEL_BG}
      >
        <div className="pointer-events-none absolute inset-0" style={GRID} />

        <div className="relative">
          <Logo light />
        </div>

        <div className="relative">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
            Connect. Chat. Stay close.
          </p>
          <h2 className="font-display text-[3.4rem] font-medium leading-[1.05] tracking-tight">
            Conversations
            <br />
            that feel <span className="italic text-emerald-300">real.</span>
          </h2>

          {/* Preview card */}
          <div className="mt-10 max-w-sm rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-float backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <Avatar name="Aarav Mehta" size="sm" online />
              <div>
                <p className="text-sm font-semibold leading-tight">Aarav Mehta</p>
                <p className="text-xs text-emerald-300">online</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-white/10 px-3.5 py-2 text-white/90">
                Shipping the new build tonight 🚀
              </div>
              <div className="ml-auto flex w-fit max-w-[85%] items-center gap-1.5 rounded-2xl rounded-br-md bubble-out px-3.5 py-2">
                Nice! Send me the link
                <CheckCheck size={14} className="text-sky-200" />
              </div>
              <div className="flex w-fit gap-1 rounded-2xl rounded-bl-md bg-white/10 px-3.5 py-3">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="size-1.5 animate-bounce rounded-full bg-white/60"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {CHIPS.map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80"
              >
                <Icon size={13} className="text-emerald-300" />
                {text}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          © 2026 ChatEase. Built for better conversations.
        </p>
      </section>

      {/* Form side */}
      <main className="relative flex items-center justify-center px-5 py-10 sm:px-10">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(40% 35% at 100% 0%, rgba(16,185,129,0.10), transparent 70%)",
          }}
        />
        <div className="relative w-full max-w-[26rem] animate-fade-up">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>

          <p className="mb-3 text-sm font-semibold text-brand">{eyebrow}</p>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8">{footer}</div>}
        </div>
      </main>
    </div>
  );
}