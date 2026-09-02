export function ClipMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <img src="/logo.jpg" alt="" className={`rounded-xl object-cover ${className}`} />
  );
}
