import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, MessageCircle } from "lucide-react";
import type { Conversation } from "../../api/conversations";
import { tokenStore } from "../../api/client";
import { clearSession } from "../../utils/session";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import ContactPanel from "./ContactPanel";

interface Props {
  token: string;
  currentUserId: number;
}

export default function ChatLayout({ token, currentUserId }: Props) {
  const [active, setActive] = useState<Conversation | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    clearSession();
    tokenStore.clear();
    setActive(null);
    setShowInfo(false);
    navigate("/login", { replace: true });
  }

  return (
    <div className="relative h-dvh overflow-hidden bg-bg lg:p-5">
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          backgroundImage:
            "radial-gradient(40% 40% at 0% 0%, rgba(16,185,129,0.14), transparent), radial-gradient(40% 40% at 100% 100%, rgba(45,212,191,0.12), transparent)",
        }}
      />

      <div className="relative flex h-full overflow-hidden bg-surface lg:rounded-3xl lg:border lg:border-line lg:shadow-float">
        <div
          className={`${
            active ? "hidden md:block" : "block"
          } w-full shrink-0 md:w-80 lg:w-[22rem]`}
        >
          <Sidebar
            token={token}
            activeId={active?.id ?? null}
            onSelect={setActive}
          />
        </div>

        <main
          className={`${
            active ? "block" : "hidden md:grid"
          } chat-bg min-w-0 flex-1 place-items-center`}
        >
          {active ? (
            <ChatWindow
              key={active.id}
              conversation={active}
              token={token}
              currentUserId={currentUserId}
              onBack={() => {
                setActive(null);
                setShowInfo(false);
              }}
              onOpenInfo={() => setShowInfo(true)}
            />
          ) : (
            <div className="relative max-w-xs animate-fade-up px-6 text-center">
              <div className="mx-auto mb-5 grid size-20 place-items-center rounded-3xl bg-brand-gradient text-white shadow-glow">
                <MessageCircle size={34} strokeWidth={2} />
              </div>

              <h2 className="font-display text-2xl font-medium tracking-tight">
                Your conversations, beautifully simple.
              </h2>

              <p className="mt-2 text-sm text-muted">
                Select a chat from the list to start messaging.
              </p>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-fg"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </main>

        {active && showInfo && (
          <div className="fixed inset-0 z-30 animate-slide-in xl:static xl:inset-auto xl:z-auto xl:w-80 xl:shrink-0">
            <ContactPanel
              conversation={active}
              onClose={() => setShowInfo(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}