import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {useRef} from 'react'

import type {MemexItemModel} from '../../../models/memex-item-model'
import {CardBaseWithSash} from './card-base-with-sash'
import {CardInternalContent} from './card-internal-content'

export function DragOverlayCard({item}: {item: MemexItemModel}) {
  return (
    <CardBaseWithSash
      inert="inert"
      sx={{
        opacity: 0.5,
        borderRadius: 2,
        borderColor: 'border.muted',
        borderWidth: '1px',
        borderStyle: 'solid',
        boxShadow: 'shadow.medium',
      }}
      {...testIdProps('drag-overlay')}
    >
      <CardInternalContent item={item} contextMenuRef={useRef(null)} removeItem={noop} isDragging />
    </CardBaseWithSash>
  )
}
