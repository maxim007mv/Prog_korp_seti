interface GlassCardProps {
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

export function GlassCard({ className = "", contentClassName = "", children }: GlassCardProps) {
  return (
    <div className={`liquidGlass-wrapper ${className}`}>
      <div className="liquidGlass-effect" />
      <div className="liquidGlass-tint" />
      <div className="liquidGlass-shine" />
      <div className={`liquidGlass-text ${contentClassName}`}>{children}</div>
    </div>
  );
}
