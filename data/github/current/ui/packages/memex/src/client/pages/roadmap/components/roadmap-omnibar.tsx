import {memo} from 'react'
import type {Row} from 'react-table'

import {Omnibar} from '../../../components/omnibar/omnibar'
import {OmnibarContainer} from '../../../components/omnibar/omnibar-container'
import {DefaultOmnibarPlaceholder} from '../../../components/omnibar/omnibar-placeholder'
import {useScrollToNewItem} from '../../../components/react_table/hooks/use-scroll-to-new-item'
import {useTableOmnibarFocus} from '../../../components/react_table/hooks/use-table-omnibar-focus'
import {ROADMAP_ROW_HEIGHT} from '../../../components/roadmap/constants'
import {useMeasureScrollbars} from '../../../hooks/use-measure-scrollbars'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {useRoadmapNavigation} from '../roadmap-view-provider'

export const RoadmapFixedOmnibar = memo<{rows: Array<Row<MemexItemModel>>}>(function RoadmapFixedOmnibar({rows}) {
  const {omnibarRef, onFocus, onKeyDown} = useTableOmnibarFocus()
  const {roadmapRef} = useRoadmapNavigation()
  const {horizontalScrollbarSize, verticalScrollbarSize} = useMeasureScrollbars(roadmapRef)
  const {onNewItem} = useScrollToNewItem(roadmapRef, rows, {rowHeight: ROADMAP_ROW_HEIGHT, left: undefined})

  return (
    <OmnibarContainer
      horizontalScrollbarSize={horizontalScrollbarSize}
      verticalScrollbarSize={verticalScrollbarSize}
      isFixed
    >
      <Omnibar
        ref={omnibarRef}
        onKeyDown={onKeyDown}
        onInputFocus={onFocus}
        role="row"
        childElementRole="gridcell"
        onAddItem={onNewItem}
        defaultPlaceholder={DefaultOmnibarPlaceholder}
        isFixed
      />
    </OmnibarContainer>
  )
})
