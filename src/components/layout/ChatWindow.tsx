import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, CheckCheck, Info, Paperclip, Send } from "lucide-react";
import { getMessages, sendMessage } from "../../api/messages";
import { markRead, type Conversation } from "../../api/conversations";
import type { Message } from "../../types";
import { formatTime } from "../../utils/time";
import Avatar from "../ui/Avatar";
import { getConversationName } from "./Sidebar";

interface Props {
  conversation: Conversation;
  token: string;
  currentUserId: number;
  onBack: () => void;
  onOpenInfo: () => void;
}

const sortById = (list: Message[]) => [...list].sort((a, b) => a.id - b.id);

// id + status ka signature: tick badle toh bhi UI update ho
const signature = (list: Message[]) =>
  list.map((m) => `${m.id}:${m.status ?? ""}`).join(",");

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" });
}

function Ticks({ status }: { status?: Message["status"] }) {
  if (status === "READ") return <CheckCheck size={15} className="text-sky-400" />;
  if (status === "DELIVERED") return <CheckCheck size={15} className="text-white/70" />;
  return <Check size={15} className="text-white/70" />;
}

export default function ChatWindow({
  conversation,
  token,
  currentUserId,
  onBack,
  onOpenInfo,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  const name = getConversationName(conversation);

  // Initial load
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await getMessages(token, conversation.id);
        if (!cancelled) setMessages(sortById(data));
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Unable to load messages");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, conversation.id, reloadKey]);

  // Temporary polling, WebSocket aane par hata denge
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const data = sortById(await getMessages(token, conversation.id));
        setMessages((prev) =>
          signature(prev) === signature(data) ? prev : data
        );
      } catch {
        // silent, agla poll try karega
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [token, conversation.id]);

  // Chat khuli hai, toh jo bhi messages dikh rahe hain wo padhe hue hain
  useEffect(() => {
    if (loading || error) return;
    markRead(token, conversation.id).catch(() => {});
  }, [loading, error, messages.length, token, conversation.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    const content = text.trim();
    if (!content || sending) return;

    try {
      setSending(true);
      setSendError("");
      const msg = await sendMessage(token, conversation.id, content);
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      setText("");
    } catch (err) {
      console.error(err);
      setSendError("Message send nahi hua. Dobara try karo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-bg flex h-full w-full flex-col">
      {/* Header */}
      <header className="flex items-center gap-2 border-b border-line bg-surface/85 px-2 py-2.5 backdrop-blur-xl md:px-4">
        <button
          onClick={onBack}
          aria-label="Back"
          className="grid size-10 shrink-0 place-items-center rounded-full transition hover:bg-surface-2 md:hidden"
        >
          <ArrowLeft size={22} />
        </button>

        <Avatar name={name} size="sm" />

        <div className="min-w-0 flex-1 pl-1">
          <p className="truncate font-semibold leading-tight">{name}</p>
          <p className="text-xs text-muted">
            {conversation.type === "DIRECT" ? "Direct chat" : "Group"}
          </p>
        </div>

        <button
          onClick={onOpenInfo}
          aria-label="Contact info"
          className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg"
        >
          <Info size={20} />
        </button>
      </header>

      {/* Messages */}
      <div className="scroll-thin flex-1 space-y-1.5 overflow-y-auto px-3 py-5 md:px-8">
        {loading && (
          <div className="space-y-3">
            {[60, 40, 70, 50].map((w, i) => (
              <div
                key={i}
                className={`flex animate-pulse ${i % 2 ? "justify-end" : "justify-start"}`}
              >
                <div className="h-11 rounded-2xl bg-surface-2" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="py-10 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-3 rounded-xl bg-surface px-4 py-2 text-sm font-medium shadow-soft transition hover:bg-surface-2"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="mx-auto mt-10 w-fit rounded-2xl bg-surface px-5 py-3 text-sm text-muted shadow-soft">
            No messages yet. Say hi 👋
          </div>
        )}

        {!loading &&
          !error &&
          messages.map((m, i) => {
            const mine = m.senderId === currentUserId;
            const newDay =
              i === 0 ||
              new Date(messages[i - 1].createdAt).toDateString() !==
                new Date(m.createdAt).toDateString();

            return (
              <div key={m.id}>
                {newDay && (
                  <div className="my-4 flex justify-center">
                    <span className="rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-semibold text-muted shadow-soft">
                      {dayLabel(m.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`flex animate-fade-up ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2 md:max-w-[62%] ${
                      mine
                        ? "bubble-out rounded-br-md shadow-glow"
                        : "rounded-bl-md border border-line bg-bubble-in shadow-soft"
                    }`}
                  >
                    {!mine && conversation.type !== "DIRECT" && (
                      <p className="mb-0.5 text-xs font-semibold text-brand">
                        {m.senderName}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words text-[15px] leading-6">
                      {m.content}
                    </p>
                    <div
                      className={`-mb-0.5 mt-0.5 flex items-center justify-end gap-1 text-[11px] ${
                        mine ? "text-white/75" : "text-muted"
                      }`}
                    >
                      {formatTime(m.createdAt)}
                      {mine && <Ticks status={m.status} />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <footer className="px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:px-6">
        {sendError && <p className="px-3 pb-2 text-xs text-red-600">{sendError}</p>}

        <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1.5 shadow-soft transition focus-within:border-brand/40 focus-within:ring-4 focus-within:ring-brand/10">
          <button
            aria-label="Attach"
            className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            <Paperclip size={20} />
          </button>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message"
            className="h-10 min-w-0 flex-1 bg-transparent px-2 text-[15px] outline-none placeholder:text-muted"
          />

          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            aria-label="Send"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-gradient text-white shadow-glow transition hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:shadow-none"
          >
            <Send size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
}