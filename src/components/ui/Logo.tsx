import { MessageCircle } from "lucide-react";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-10 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
        <MessageCircle size={20} strokeWidth={2.2} />
      </div>
      <span
        className={`text-xl font-bold tracking-tight ${light ? "text-white" : "text-fg"}`}
      >
        Chat<span className={light ? "text-emerald-300" : "text-brand"}>Ease</span>
      </span>
    </div>
  );
}