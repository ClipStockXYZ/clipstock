export function ClipMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect x="4" y="8" width="56" height="48" rx="8" fill="#fffaf3" stroke="#1a1814" strokeWidth="2.5" />
      <rect x="4" y="8" width="56" height="12" rx="8" fill="#1f6b4a" />
      <rect x="4" y="14" width="56" height="6" fill="#1f6b4a" />
      <rect x="24" y="2" width="16" height="18" rx="4" fill="#b0894f" stroke="#1a1814" strokeWidth="2" />
      <rect x="28" y="6" width="8" height="8" rx="2" fill="#fffaf3" />
      <path d="M14 32h36M14 40h24M14 48h18" stroke="#1a1814" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
