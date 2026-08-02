export default function SectionBadge({ children }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-neutral-950 text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full">
      <span className="size-1.5 rounded-full bg-emerald-400" />
      {children}
    </div>
  );
}
