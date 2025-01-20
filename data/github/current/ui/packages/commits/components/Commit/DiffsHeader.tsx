import {LinesChangedCounterLabel} from '@github-ui/diff-file-header'
import {ArrowUpIcon} from '@primer/octicons-react'
import {Button, Heading, Text} from '@primer/react'
import {useRef} from 'react'

import {useStickyObserver} from '../../hooks/use-sticky-observer'
import type {HeaderInfo} from '../../types/commit-types'
import {DiffViewSettings} from './DiffViewSettings'

interface DiffsHeaderProps {
  headerInfo: HeaderInfo
  treeToggleElement: JSX.Element
}

export function DiffsHeader({treeToggleElement, headerInfo}: DiffsHeaderProps) {
  const diffHeaderRef = useRef<HTMLDivElement>(null)
  const isStickied = useStickyObserver(diffHeaderRef)
  const hideLinesChangedSx = isStickied ? {display: ['none', 'inherit']} : {} // make room for the Top button on mobile

  return (
    <div
      className={`d-flex flex-items-center flex-justify-between gap-2 pt-3 pt-lg-4 pb-2 position-sticky top-0 color-bg-default`}
      style={{zIndex: 2}}
      ref={diffHeaderRef}
    >
      <div className="d-flex flex-items-center">
        {treeToggleElement}
        <Heading as="h2" className="mx-2 f4">
          {headerInfo.filesChangedString} file{headerInfo.filesChanged > 1 ? 's' : ''} changed
        </Heading>
        <LinesChangedCounterLabel sx={hideLinesChangedSx} isAddition>
          +{headerInfo.additions}
        </LinesChangedCounterLabel>
        <LinesChangedCounterLabel sx={hideLinesChangedSx} isAddition={false}>
          -{headerInfo.deletions}
        </LinesChangedCounterLabel>
        <Text sx={{fontSize: 0, ml: 2, color: 'fg.muted', whiteSpace: 'nowrap', ...hideLinesChangedSx}}>
          lines changed
        </Text>
      </div>

      <div className="d-flex">
        {isStickied && <GoToTopButton />}
        <DiffViewSettings />
      </div>
    </div>
  )
}

const GoToTopButton = () => {
  return (
    <Button
      leadingVisual={ArrowUpIcon}
      variant="invisible"
      className="fgColor-default px-2 f6 gap-1"
      onClick={event => {
        event.preventDefault()
        window.scrollTo({top: 0, behavior: 'smooth'})
      }}
    >
      Top
    </Button>
  )
}
