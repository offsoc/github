import {useResizeObserver} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import type {RefObject} from 'react'
import {useCallback, useEffect, useMemo, useState} from 'react'

const MAX_CONDENSED_WIDTH = 768

export function useMarkdownStyles(composerRef: RefObject<HTMLDivElement>) {
  const [condensed, setCondensed] = useState<boolean>(false)

  const markdownStyles: BetterSystemStyleObject = useMemo(() => {
    return {
      footer: {
        flexWrap: 'wrap-reverse',

        // styles to hide text on the the default comment composer buttons
        '& > div:first-of-type [data-component="text"]': {
          display: condensed ? 'none' : 'block',
        },

        // styles to wrap custom comment composer buttons
        '& > div:last-of-type': {
          flexWrap: 'wrap',
        },
      },
    }
  }, [condensed])

  // checks for the width of the composer and updates the condensed state accordingly
  const updateCondensedState = useCallback(() => {
    const clientWidth = composerRef?.current?.clientWidth || MAX_CONDENSED_WIDTH
    setCondensed(clientWidth < MAX_CONDENSED_WIDTH)
  }, [composerRef])

  // updates the condensed state when the composer's width is resized
  useResizeObserver(() => {
    updateCondensedState()
  }, composerRef)

  // updates the condensed state on mount
  useEffect(() => {
    updateCondensedState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {markdownStyles}
}
