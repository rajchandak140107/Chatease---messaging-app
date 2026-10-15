import { Image as ImageIcon, X } from "lucide-react";
import type { Conversation } from "../../api/conversations";
import Avatar from "../ui/Avatar";
import { getConversationName } from "./Sidebar";

interface Props {
  conversation: Conversation;
  onClose: () => void;
}

export default function ContactPanel({ conversation, onClose }: Props) {
  const name = getConversationName(conversation);
  const isDirect = conversation.type === "DIRECT";

  const lastActive = new Date(conversation.updatedAt).toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <aside className="scroll-thin flex h-full w-full flex-col overflow-y-auto border-l border-line bg-surface">
      {/* Cover */}
      <div className="relative h-32 shrink-0 overflow-hidden bg-brand-gradient">
        <div className="absolute -right-8 -top-10 size-40 rounded-full bg-white/15" />
        <div className="absolute -bottom-12 left-6 size-32 rounded-full bg-black/10" />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
        >
          <X size={20} />
        </button>
      </div>

      {/* Identity */}
      <div className="-mt-12 flex flex-col items-center px-5">
        <Avatar name={name} size="xl" className="ring-4 ring-surface" />
        <h2 className="mt-3 text-lg font-bold tracking-tight">{name}</h2>
        <span className="mt-1 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-hover">
          {isDirect ? "Direct chat" : "Group"}
        </span>
      </div>

      {/* Details */}
      <div className="mx-4 mt-6 divide-y divide-line rounded-2xl border border-line">
        <div className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="text-muted">Type</span>
          <span className="font-medium">{isDirect ? "One-to-one" : "Group"}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="text-muted">Last activity</span>
          <span className="font-medium">{lastActive}</span>
        </div>
      </div>

      {/* Media */}
      <div className="mx-4 mb-6 mt-6">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Shared media
        </p>
        <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-surface-2/60 px-4 py-8 text-center">
          <ImageIcon size={24} className="text-muted" />
          <p className="mt-2 text-sm text-muted">No media shared yet</p>
        </div>
      </div>
    </aside>
  );
}