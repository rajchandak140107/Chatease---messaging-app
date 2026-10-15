const GRADIENTS = [
  "from-emerald-400 to-teal-600",
  "from-amber-300 to-orange-500",
  "from-sky-400 to-indigo-500",
  "from-rose-400 to-pink-600",
  "from-violet-400 to-purple-600",
  "from-lime-400 to-green-600",
];

const SIZES = {
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-14 text-base",
  xl: "size-24 text-3xl",
};

function hash(s: string) {
  let h = 0;
  for (const ch of Array.from(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

interface Props {
  name: string;
  size?: keyof typeof SIZES;
  online?: boolean;
  className?: string;
}

export default function Avatar({ name, size = "md", online, className = "" }: Props) {
  const initials =
  name
    .replace(/\(.*?\)/g, "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
  const gradient = GRADIENTS[hash(name) % GRADIENTS.length];

  return (
    <div className="relative shrink-0">
      <div
        className={`${SIZES[size]} ${gradient} ${className} grid place-items-center rounded-full bg-gradient-to-br font-semibold text-white shadow-soft`}
      >
        {initials}
      </div>
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-surface ${
            online ? "bg-emerald-500" : "bg-slate-300"
          }`}
        />
      )}
    </div>
  );
}