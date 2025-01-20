import {useEffect, useRef} from 'react'

import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {useActivePages} from '../../state-providers/data-refresh/use-active-pages'
import useIsVisible from '../board/hooks/use-is-visible'

export const TablePage = ({index, children}: {index: number; children: React.ReactNode}) => {
  // we want this to effectively be a no-op for users not in the flag
  const {memex_table_without_limits} = useEnabledFeatures()
  // since children can be undefined, typescript is upset if we don't return null here
  if (!memex_table_without_limits) return <>{children}</>

  return <TablePageInner index={index}>{children}</TablePageInner>
}

const TablePageInner = ({index, children}: {index: number; children: React.ReactNode}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const {isVisible} = useIsVisible({ref})
  const {setPages} = useActivePages()
  useEffect(() => {
    if (isVisible) {
      setPages(pages => {
        const newPages = [...pages]
        if (!newPages.includes(index)) {
          newPages.push(index)
        }
        return newPages
      })
    } else {
      setPages(pages => pages.filter(page => page !== index))
    }
  }, [isVisible, index, setPages])

  return <span ref={ref}>{children}</span>
}
