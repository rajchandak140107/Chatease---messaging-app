import { useEffect, useState } from "react";
import { Loader2, Search, SearchX, UserRound, X } from "lucide-react";
import { createDirectConversation, type Conversation } from "../../api/conversations";
import { searchUsers } from "../../api/users";
import { getSession } from "../../utils/session";
import type { User } from "../../types";
import Avatar from "../ui/Avatar";

interface Props {
  token: string;
  existing: Conversation[];
  onClose: () => void;
  onOpen: (conversation: Conversation, isNew: boolean) => void;
}

export default function NewChatModal({ token, existing, onClose, onOpen }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [creatingId, setCreatingId] = useState<number | null>(null);

  const trimmed = query.trim();
  const session = getSession();

  // Debounced search (300ms, minimum 2 characters)
  useEffect(() => {
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    setSearching(true);
    setError("");

    const timer = setTimeout(async () => {
      try {
        const data = await searchUsers(token, trimmed, controller.signal);
        setResults(data);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Search failed. Try again.");
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, token]);

  // Esc se band
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function pick(user: User) {
    if (creatingId !== null) return;

    // chat already hai toh wahi khol do (self-chat mein bhi kaam karta hai)
    const found = existing.find(
      (c) => c.type === "DIRECT" && c.otherUserId === user.id
    );
    if (found) {
      onOpen(found, false);
      return;
    }

    try {
      setCreatingId(user.id);
      setError("");
      const created = await createDirectConversation(token, user.id);
      onOpen(created, true);
    } catch (err) {
      console.error(err);
      setError("Chat start nahi ho payi. Dobara try karo.");
      setCreatingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel: mobile pe bottom sheet, desktop pe center modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New chat"
        className="relative flex max-h-[85dvh] w-full animate-fade-up flex-col overflow-hidden rounded-t-3xl bg-surface shadow-float sm:max-w-md sm:rounded-3xl"
      >
        {/* Drag handle (mobile) */}
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line sm:hidden" />

        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">New chat</h2>
            <p className="text-sm text-muted">Find someone by name or username</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3 pt-2">
          <div className="flex h-12 items-center gap-2 rounded-2xl border border-line bg-surface-2 px-3.5 transition focus-within:border-brand/40 focus-within:bg-surface focus-within:ring-4 focus-within:ring-brand/10">
            <Search size={18} className="text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people"
              className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-muted"
            />
            {searching && <Loader2 size={17} className="animate-spin text-muted" />}
          </div>
        </div>

        {/* Results */}
        <div className="scroll-thin min-h-40 flex-1 overflow-y-auto px-2 pb-4">
          {/* Message yourself */}
          {session && trimmed.length < 2 && (
            <button
              onClick={() =>
                pick({
                  id: session.id,
                  name: session.name,
                  username: session.username,
                  email: session.email,
                })
              }
              disabled={creatingId !== null}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-surface-2 disabled:opacity-60"
            >
              <Avatar name={session.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold">
                  {session.name} (You)
                </p>
                <p className="truncate text-sm text-muted">Message yourself</p>
              </div>
              {creatingId === session.id && (
                <Loader2 size={18} className="animate-spin text-brand" />
              )}
            </button>
          )}

          {trimmed.length < 2 && (
            <div className="grid place-items-center px-6 py-8 text-center">
              <div className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
                <UserRound size={22} />
              </div>
              <p className="mt-3 text-sm text-muted">
                Type at least 2 characters to search
              </p>
            </div>
          )}

          {error && (
            <p className="px-4 py-4 text-center text-sm text-red-600">{error}</p>
          )}

          {trimmed.length >= 2 && !searching && !error && results.length === 0 && (
            <div className="grid place-items-center px-6 py-10 text-center">
              <SearchX size={26} className="text-muted" />
              <p className="mt-3 text-sm text-muted">
                No one found for "{trimmed}"
              </p>
            </div>
          )}

          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => pick(user)}
              disabled={creatingId !== null}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-surface-2 disabled:opacity-60"
            >
              <Avatar name={user.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold">{user.name}</p>
                <p className="truncate text-sm text-muted">@{user.username}</p>
              </div>
              {creatingId === user.id && (
                <Loader2 size={18} className="animate-spin text-brand" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}