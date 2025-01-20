/** Visually hidden text that will still be read by a screen reader. Link with aria-describedby. */
export const HiddenDescription = ({children, id}: {children: React.ReactNode; id: string}) => (
  <span className="sr-only" id={id} aria-live="polite">
    {children}
  </span>
)
