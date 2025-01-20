/**
 * SVG wrapper for temporary icons.
 * @see https://github.com/github/memex/blob/main/docs/frontend/custom-icon.md
 */
export function BaseIconSvg({children, className}: {children: React.ReactNode; className?: string}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      role="img"
      className={`octicon ${className}`}
      style={{
        display: 'inline-block',
        userSelect: 'none',
        overflow: 'visible',
      }}
    >
      {children}
    </svg>
  )
}
