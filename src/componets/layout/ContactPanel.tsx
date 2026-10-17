import { Phone, Video } from "lucide-react";

export default function ContactPanel() {
  return (
    <aside className="hidden w-72 shrink-0 border-l border-white/10 bg-[#10151c] lg:block">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="font-semibold text-white">Contact info</h2>
      </div>

      <div className="flex flex-col items-center px-5 py-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-600/20 text-xl font-bold text-purple-400">
          AM
        </div>

        <h3 className="mt-4 font-semibold text-white">Aman</h3>
        <p className="text-sm text-green-400">Online</p>

        <div className="mt-6 flex gap-3">
          <button className="rounded-xl bg-white/5 p-3 text-gray-300 hover:bg-white/10">
            <Phone size={18} />
          </button>

          <button className="rounded-xl bg-white/5 p-3 text-gray-300 hover:bg-white/10">
            <Video size={18} />
          </button>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-5">
        <p className="text-xs uppercase tracking-wider text-gray-500">
          About
        </p>
        <p className="mt-2 text-sm text-gray-300">
          Building something cool 🚀
        </p>
      </div>
    </aside>
  );
}