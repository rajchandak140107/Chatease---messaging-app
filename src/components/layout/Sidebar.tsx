import {
  LogOut,
  Plus,
  Search,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getConversations, type Conversation } from "../../api/conversations";
import { tokenStore } from "../../api/client";
import { clearSession, getSession } from "../../utils/session";

import Avatar from "../ui/Avatar";
import Logo from "../ui/Logo";
import NewChatModal from "./NewChatModal";

interface SidebarProps {
  token: string;
  activeId: number | null;
  onSelect: (conversation: Conversation) => void;
}

export function getConversationName(c: Conversation) {
  if (c.type === "DIRECT") {
    const meId = getSession()?.id;

    if (meId !== undefined && c.otherUserId === meId) {
      return `${c.otherUserName ?? "You"} (You)`;
    }

    return c.otherUserName || "Unknown user";
  }

  return c.title || "Group";
}

function formatListTime(iso: string) {
  const d = new Date(iso);

  if (d.toDateString() === new Date().toDateString()) {
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

export default function Sidebar({
  token,
  activeId,
  onSelect,
}: SidebarProps) {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [showNew, setShowNew] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const session = getSession();

  function handleLogout() {
    clearSession();
    tokenStore.clear();
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true);
        setError("");

        const data = await getConversations(token);
        setConversations(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load conversations");
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, [token, reloadKey]);

  // Temporary polling until WebSocket updates are implemented.
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const data = await getConversations(token);

        setConversations((prev) =>
          JSON.stringify(prev) === JSON.stringify(data) ? prev : data
        );
      } catch {
        // Retry on the next polling cycle.
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [token]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return conversations;

    return conversations.filter((c) =>
      getConversationName(c).toLowerCase().includes(q)
    );
  }, [conversations, query]);

  function handleSelect(c: Conversation) {
    setConversations((prev) =>
      prev.map((x) =>
        x.id === c.id ? { ...x, unreadCount: 0 } : x
      )
    );

    setShowSettings(false);
    onSelect(c);
  }

  function handleOpen(c: Conversation, isNew: boolean) {
    if (isNew) {
      setConversations((prev) => [
        c,
        ...prev.filter((x) => x.id !== c.id),
      ]);
    }

    setShowNew(false);
    handleSelect(c);
  }

  return (
    <aside className="relative flex h-full w-full flex-col border-r border-line bg-surface">
      {/* Header */}
      <div className="relative flex items-center justify-between px-4 pb-3 pt-5 md:px-5">
        <Logo />

        <button
          type="button"
          aria-label="Settings"
          title="Settings"
          aria-expanded={showSettings}
          onClick={() => setShowSettings((prev) => !prev)}
          className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg"
        >
          <Settings size={19} />
        </button>

        {/* Desktop settings dropdown */}
        {showSettings && (
          <div className="absolute right-4 top-16 z-50 hidden w-72 rounded-2xl border border-line bg-surface p-4 shadow-float md:block">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">My Profile</h3>

              <button
                type="button"
                aria-label="Close settings"
                onClick={() => setShowSettings(false)}
                className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <Avatar name={session?.name || "User"} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {session?.name || "Name unavailable"}
                </p>
                <p className="truncate text-xs text-muted">
                  @{session?.username || "username unavailable"}
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t border-line pt-3">
              <div>
                <p className="text-xs text-muted">Full name</p>
                <p className="break-words text-sm font-medium">
                  {session?.name || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Username</p>
                <p className="break-words text-sm font-medium">
                  {session?.username || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Email</p>
                <p className="break-words text-sm font-medium">
                  {session?.email || "Not available"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex w-full items-center gap-2 border-t border-line pt-3 text-sm font-medium text-muted transition hover:text-red-600"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Mobile settings bottom sheet */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Close settings"
            onClick={() => setShowSettings(false)}
            className="absolute inset-0 bg-black/35"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="My Profile"
            className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-line bg-surface p-5 pb-8 shadow-float"
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />

            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold">My Profile</h3>

              <button
                type="button"
                aria-label="Close settings"
                onClick={() => setShowSettings(false)}
                className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-5 flex items-center gap-3">
              <Avatar name={session?.name || "User"} />

              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {session?.name || "Name unavailable"}
                </p>
                <p className="truncate text-sm text-muted">
                  @{session?.username || "username unavailable"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted">Full name</p>
                <p className="break-words text-sm font-medium">
                  {session?.name || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Username</p>
                <p className="break-words text-sm font-medium">
                  {session?.username || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Email</p>
                <p className="break-words text-sm font-medium">
                  {session?.email || "Not available"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              <LogOut size={18} />
              Logout
            </button>
          </section>
        </div>
      )}

      {/* Search conversations */}
      <div className="px-4 pb-3">
        <div className="flex h-11 items-center gap-2 rounded-2xl border border-transparent bg-surface-2 px-3.5 transition focus-within:border-brand/40 focus-within:bg-surface focus-within:ring-4 focus-within:ring-brand/10">
          <Search size={17} className="text-muted" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
      </div>

      {/* New chat: compact section heading */}
      <div className="flex items-center justify-between px-5 pb-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Messages
        </span>

        {!loading && !error && conversations.length > 0 && (
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted">
            {conversations.length}
          </span>
        )}
      </div>

      {/* Conversation list */}
      <div className="scroll-thin flex-1 overflow-y-auto px-2 pb-20">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-3 px-3 py-3"
            >
              <div className="size-11 shrink-0 rounded-full bg-surface-2" />

              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 rounded-full bg-surface-2" />
                <div className="h-3 w-3/4 rounded-full bg-surface-2/70" />
              </div>
            </div>
          ))}

        {!loading && error && (
          <div className="px-3 py-8 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-3 rounded-xl bg-surface-2 px-4 py-2 text-sm font-medium transition hover:bg-line"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-muted">
            No conversations yet. Start a new chat!
          </p>
        )}

        {!loading &&
          !error &&
          conversations.length > 0 &&
          filtered.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted">
              No chats match "{query}"
            </p>
          )}

        {!loading &&
          !error &&
          filtered.map((conversation) => {
            const name = getConversationName(conversation);
            const active = conversation.id === activeId;
            const unread = active
              ? 0
              : conversation.unreadCount ?? 0;
            const mine = false;

            return (
              <button
                type="button"
                key={conversation.id}
                onClick={() => handleSelect(conversation)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  active
                    ? "bg-brand-soft/70 ring-1 ring-brand/15"
                    : "hover:bg-surface-2"
                }`}
              >
                <Avatar name={name} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[15px] font-semibold">
                      {name}
                    </p>

                    <span
                      className={`shrink-0 text-[11px] ${
                        unread > 0
                          ? "font-semibold text-brand"
                          : "text-muted"
                      }`}
                    >
                      {formatListTime(conversation.updatedAt)}
                    </span>
                  </div>

                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p
                      className={`truncate text-sm ${
                        unread > 0 && !mine
                          ? "font-semibold text-fg"
                          : "text-muted"
                      }`}
                    >
                      {mine ? "You: " : ""}
                      {conversation.lastMessage ?? "No messages yet"}
                    </p>

                    {unread > 0 && (
                      <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-brand-fg">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
      </div>

      {/* Floating New Chat button */}
    
{/* Floating New Chat button */}
<button
  type="button"
  aria-label="Start a new chat"
  title="New Chat"
  onClick={() => {
    setShowSettings(false);
    setShowNew(true);
  }}
  className="absolute bottom-5 right-5 z-20 flex h-12 items-center gap-2 rounded-2xl bg-brand-gradient px-4 text-white shadow-glow transition hover:scale-105 hover:brightness-110 active:scale-95"
>
  <Plus size={20} strokeWidth={2.5} />
  <span className="text-sm font-semibold">New Chat</span>
</button>

      {/* New chat modal */}
      {showNew && (
        <NewChatModal
          token={token}
          existing={conversations}
          onClose={() => setShowNew(false)}
          onOpen={handleOpen}
        />
      )}
    </aside>
  );
}