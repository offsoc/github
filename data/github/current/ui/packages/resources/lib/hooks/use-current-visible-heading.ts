import {useState, useEffect, type MutableRefObject} from 'react'

export const useCurrentVisibleHeading = (options: {ref: MutableRefObject<HTMLDivElement | null>}) => {
  const [currVisibleHeading, setCurrVisibleHeading] = useState<string | undefined>()

  useEffect(() => {
    if (options.ref.current === null) {
      return
    }

    // This will return the current active heading for the table of contents to apply the active style to the respective active bullet points
    const observer = new IntersectionObserver(
      entries => {
        const intersecting = entries.find(entry => entry.isIntersecting)

        if (intersecting === undefined || typeof intersecting.target.id !== 'string') {
          return
        }

        setCurrVisibleHeading(intersecting.target.id)
      },
      {
        threshold: 0.75,
      },
    )

    /**
     * Get all the headings in the scope of the ref, which should be the content container.
     */
    const headings = Array.from(options.ref.current.querySelectorAll(':scope h2[id], :scope h3[id], :scope h4[id]'))

    for (const heading of headings) {
      observer.observe(heading)
    }

    return () => {
      for (const heading of headings) {
        observer.unobserve(heading)
      }
    }
  }, [options.ref])

  return currVisibleHeading
}
