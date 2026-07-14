interface AdPlaceholderProps {
  className?: string
}

export default function AdPlaceholder({ className = '' }: AdPlaceholderProps) {
  return (
    <aside className={`ad-placement no-print ${className}`.trim()} aria-label="광고 영역">
      <span className="ad-label">광고</span>
      <div className="ad-placeholder">
        <span>AdSense placeholder</span>
      </div>
    </aside>
  )
}
